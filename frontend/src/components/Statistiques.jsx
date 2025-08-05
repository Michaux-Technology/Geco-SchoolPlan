import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  Grid
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import io from 'socket.io-client';

// Connexion au serveur Socket.IO
const socket = io(import.meta.env.VITE_API_URL);

// Tableau de couleurs pour les différentes lignes du graphique
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

// Tableau de couleurs pour les barres
const SUBJECT_COLORS = [
  '#8884d8', // violet
  '#82ca9d', // vert
  '#ffc658', // jaune
  '#ff8042', // orange
  '#0088FE', // bleu
  '#00C49F', // turquoise
  '#FFBB28', // jaune foncé
  '#FF8042', // orange foncé
  '#a4de6c', // vert clair
  '#d0ed57', // lime
  '#8dd1e1', // bleu clair
  '#e6b600', // or
  '#6b486b', // violet foncé
  '#98abc5', // bleu gris
  '#ff9896', // rose
  '#7f7f7f', // gris
  '#c5b0d5', // lavande
  '#c49c94', // marron clair
  '#f7b6d2', // rose clair
  '#dbdb8d'  // olive
];

const Statistiques = () => {
  const { t, i18n } = useTranslation();
  
  // États pour les données
  const [enseignants, setEnseignants] = useState([]);
  const [cours, setCours] = useState([]);
  const [selectedEnseignants, setSelectedEnseignants] = useState([]);
  const [coursParPeriode, setCoursParPeriode] = useState([]);
  const [coursParMatiere, setCoursParMatiere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enseignantsCourbes, setEnseignantsCourbes] = useState({});
  const [error, setError] = useState(null);
  
  // État pour la période sélectionnée
  const [periode, setPeriode] = useState('semaine');
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth() + 1); // 1-12
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());

  // Ajouter les nouveaux états pour le graphique des matières
  const [selectedClasse, setSelectedClasse] = useState('');
  const [matiereStats, setMatiereStats] = useState([]);
  const [classes, setClasses] = useState([]);

  // Palette de couleurs pour les barres
  const barColors = [
    '#FF6B6B', // Rouge corail
    '#4ECDC4', // Turquoise
    '#45B7D1', // Bleu ciel
    '#96CEB4', // Vert menthe
    '#FFEEAD', // Jaune pâle
    '#D4A5A5', // Rose poudré
    '#9B59B6', // Violet
    '#3498DB', // Bleu
    '#E67E22', // Orange
    '#2ECC71', // Vert émeraude
    '#F1C40F', // Jaune
    '#1ABC9C', // Turquoise foncé
  ];

  // Fonction pour obtenir une couleur aléatoire de la palette
  const getRandomColor = (index) => {
    return barColors[index % barColors.length];
  };

  useEffect(() => {
    // Charger les enseignants et les cours depuis le serveur
    setLoading(true);
    let enseignantsReceived = false;
    let coursReceived = false;
    let classesReceived = false;
    
    socket.emit('getEnseignants');
    socket.emit('getCours');
    socket.emit('getClasses');
    
    // Écouteurs pour les données reçues
    socket.on('enseignantsUpdate', (data) => {
      setEnseignants(data);
      enseignantsReceived = true;
      if (coursReceived) {
        setLoading(false);
      }
    });

    socket.on('coursUpdate', (data) => {
      setCours(data);
      coursReceived = true;
      if (enseignantsReceived) {
        setLoading(false);
      }
    });

    socket.on('classesUpdate', (data) => {
      setClasses(data);
      classesReceived = true;
      if (enseignantsReceived && coursReceived) {
        setLoading(false);
      }
    });

    socket.on('error', (error) => {
      setError(error);
      setLoading(false);
    });

    // Nettoyer les écouteurs
    return () => {
      socket.off('enseignantsUpdate');
      socket.off('coursUpdate');
      socket.off('classesUpdate');
      socket.off('error');
    };
  }, []);

  // Fonction pour obtenir le numéro de la semaine (même logique que dans Planning.jsx)
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Fonction pour calculer le mois à partir de la semaine (plus précise)
  const getMoisFromSemaine = (semaine, annee = new Date().getFullYear()) => {
    // Calculer la date du début de la semaine
    const debutAnnee = new Date(annee, 0, 1);
    const joursPourSemaine = (semaine - 1) * 7;
    const dateSemaine = new Date(debutAnnee.getTime() + joursPourSemaine * 24 * 60 * 60 * 1000);
    return dateSemaine.getMonth() + 1; // +1 car getMonth() retourne 0-11
  };

  // Fonction pour calculer si une semaine appartient au mois sélectionné
  const semaineAppartientAuMois = (semaine, mois, annee = new Date().getFullYear()) => {
    const moisDeLaSemaine = getMoisFromSemaine(semaine, annee);
    return moisDeLaSemaine === mois;
  };

  // Fonction pour calculer les cours dispensés pour plusieurs enseignants
  const calculerCoursDispenses = (enseignantsList, coursData = cours, periodeActuelle = periode) => {
    if (!coursData || coursData.length === 0 || !enseignantsList || enseignantsList.length === 0) {
      setCoursParPeriode([]);
      return;
    }

    // Créer le tableau de données pour le graphique
    const donnees = enseignantsList.map(nomCompletEnseignant => {
      const [nom, prenom] = nomCompletEnseignant.split(' ');
      
      // Filtrer les cours par enseignant et exclure les cours annulés
      let coursDeLEnseignant = coursData.filter(cours => {
        if (!cours.enseignants || cours.annule) return false;
        return cours.enseignants.some(e => e.nom === nom);
      });
      
      // Filtrer par période si nécessaire
      if (periodeActuelle === 'semaine') {
        // Pour la semaine, on prend la semaine actuelle
        const semaineActuelle = getWeekNumber(new Date());
        coursDeLEnseignant = coursDeLEnseignant.filter(cours => cours.semaine === semaineActuelle);
      } else if (periodeActuelle === 'mois') {
        coursDeLEnseignant = coursDeLEnseignant.filter(cours => 
          semaineAppartientAuMois(cours.semaine, moisSelectionne, anneeSelectionnee)
        );
      } else if (periodeActuelle === 'annee') {
        coursDeLEnseignant = coursDeLEnseignant.filter(cours => 
          cours.annee === anneeSelectionnee
        );
      }
      
      // Calculer le nombre total d'heures de cours
      const totalHeures = coursDeLEnseignant.length;
      
      return {
        name: nomCompletEnseignant,
        value: totalHeures
      };
    });
    
    setCoursParPeriode(donnees);
  };

  // Mettre à jour les cours par enseignant quand les filtres changent
  useEffect(() => {
    if (selectedEnseignants.length > 0 && cours.length > 0) {
      calculerCoursDispenses(selectedEnseignants, cours, periode);
    } else {
      setCoursParPeriode([]);
    }
  }, [selectedEnseignants, cours, periode, moisSelectionne, anneeSelectionnee]);

  const handleEnseignantsChange = (event) => {
    const {
      target: { value },
    } = event;
    // On limit à 6 enseignants maximum pour la lisibilité du graphique
    if (value.length <= 6) {
      setSelectedEnseignants(
        typeof value === 'string' ? value.split(',') : value,
      );
    }
  };

  const handlePeriodeChange = (event) => {
    const nouvellePeriode = event.target.value;
    setPeriode(nouvellePeriode);
    if (selectedEnseignants.length > 0 && cours.length > 0) {
      calculerCoursDispenses(selectedEnseignants, cours, nouvellePeriode);
    }
  };

  const handleMoisChange = (event) => {
    setMoisSelectionne(parseInt(event.target.value));
  };

  const handleAnneeChange = (event) => {
    setAnneeSelectionnee(parseInt(event.target.value));
  };

  // Générer la liste des enseignants pour le menu déroulant
  const getEnseignantItems = () => {
    return enseignants.map((enseignant) => {
      const nomComplet = `${enseignant.nom} ${enseignant.prenom}`;
      return (
        <MenuItem key={enseignant._id} value={nomComplet}>
          {nomComplet}
        </MenuItem>
      );
    });
  };

  // Générer les options de mois
  const getMoisItems = () => {
    const moisNoms = [
      t('months.january'),
      t('months.february'),
      t('months.march'),
      t('months.april'),
      t('months.may'),
      t('months.june'),
      t('months.july'),
      t('months.august'),
      t('months.september'),
      t('months.october'),
      t('months.november'),
      t('months.december')
    ];
    
    return moisNoms.map((nom, index) => (
      <MenuItem key={index + 1} value={index + 1}>
        {nom}
      </MenuItem>
    ));
  };

  // Générer les options d'années
  const getAnneeItems = () => {
    const anneeActuelle = new Date().getFullYear();
    const annees = [];
    
    for (let i = anneeActuelle - 5; i <= anneeActuelle; i++) {
      annees.push(i);
    }
    
    return annees.map(annee => (
      <MenuItem key={annee} value={annee}>
        {annee}
      </MenuItem>
    ));
  };

  // Déterminer le type de graphique à afficher en fonction de la période
  const renderGraph = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Typography>{t('common.loading')}</Typography>
        </Box>
      );
    }
    
    if (coursParPeriode.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Typography>{t('statistics.noData')}</Typography>
        </Box>
      );
    }

    // Utiliser un graphique en ligne pour toutes les périodes avec plusieurs lignes
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={coursParPeriode}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            label={{ 
              value: t('statistics.teacher'), 
              position: 'insideBottomRight', 
              offset: -10 
            }} 
          />
          <YAxis 
            label={{ 
              value: t('statistics.courses'), 
              angle: -90, 
              position: 'insideLeft', 
              offset: 0 
            }} 
          />
          <Tooltip 
            formatter={(value, name) => [`${value} ${t('statistics.courses')}`, name]}
            labelFormatter={(label) => `${t('statistics.teacher')} ${label}`}
          />
          <Legend />
          {selectedEnseignants.map((enseignant, index) => (
            <Line 
              key={enseignant}
              type="monotone" 
              dataKey={enseignant} 
              name={enseignant} 
              stroke={COLORS[index % COLORS.length]} 
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Titre du graphique en fonction de la période sélectionnée
  const getGraphTitle = () => {
    let titre = t('statistics.teacherCourses');
    
    if (periode === 'mois') {
      const moisNoms = [
        t('months.january'),
        t('months.february'),
        t('months.march'),
        t('months.april'),
        t('months.may'),
        t('months.june'),
        t('months.july'),
        t('months.august'),
        t('months.september'),
        t('months.october'),
        t('months.november'),
        t('months.december')
      ];
      
      titre += ` - ${moisNoms[moisSelectionne - 1]}`;
    } else if (periode === 'annee') {
      titre += ` - ${anneeSelectionnee}`;
    }
    
    return titre;
  };

  const getCoursParEnseignant = (nomCompletEnseignant) => {
    return cours.filter(c => c.enseignant === nomCompletEnseignant);
  };

  const getDonneesGraphique = () => {
    return enseignants.map(enseignant => ({
      nom: enseignant.nom,
      cours: getCoursParEnseignant(enseignant.nom).length
    }));
  };

  // Fonction pour calculer les statistiques des matières
  const calculerStatistiquesMatiere = () => {
    if (!cours || cours.length === 0) {
      setMatiereStats([]);
      return;
    }

    // Filtrer les cours pour la classe sélectionnée et la période
    const coursFiltres = cours.filter(cours => {
      if (cours.annule || !cours.classe) return false;
      
      let appartientPeriode = true;
      
      if (periode === 'semaine') {
        const semaineActuelle = getWeekNumber(new Date());
        appartientPeriode = cours.semaine === semaineActuelle;
      } else if (periode === 'mois') {
        appartientPeriode = semaineAppartientAuMois(cours.semaine, moisSelectionne, anneeSelectionnee);
      } else if (periode === 'annee') {
        appartientPeriode = (cours.annee || new Date().getFullYear()) === anneeSelectionnee;
      }
      
      // Si aucune classe n'est sélectionnée (toutes les classes), ne pas filtrer par classe
      if (!selectedClasse || selectedClasse === '') {
        return appartientPeriode;
      }
      
      // Trouver l'objet classe par ID
      const selectedClasseObj = classes.find(c => c._id === selectedClasse);
      if (selectedClasseObj) {
        return cours.classe === selectedClasseObj.nom && appartientPeriode;
      }
      
      return appartientPeriode;
    });

    // Calculer le nombre d'heures par matière
    const heuresParMatiere = {};
    coursFiltres.forEach(cours => {
      if (!heuresParMatiere[cours.matiere]) {
        heuresParMatiere[cours.matiere] = 0;
      }
      heuresParMatiere[cours.matiere] += 1;
    });

    // Convertir en format pour le graphique avec les couleurs
    const statsData = Object.entries(heuresParMatiere).map(([matiere, heures], index) => ({
      matiere,
      heures,
      fill: SUBJECT_COLORS[index % SUBJECT_COLORS.length] // Assigner une couleur cycliquement
    }));

    // Trier par nombre d'heures décroissant
    statsData.sort((a, b) => b.heures - a.heures);
    setMatiereStats(statsData);
  };

  // Mettre à jour les stats quand la classe ou la période change
  useEffect(() => {
    calculerStatistiquesMatiere();
  }, [selectedClasse, cours, periode, moisSelectionne, anneeSelectionnee]);

  // Fonction pour calculer les cours par matière
  const calculerCoursParMatiere = (coursData = cours, periodeActuelle = periode) => {
    if (!coursData || coursData.length === 0) {
      setCoursParMatiere([]);
      return;
    }

    // Filtrer les cours par période si nécessaire
    let coursFiltres = coursData.filter(cours => !cours.annule);
    
    if (periodeActuelle === 'semaine') {
      // Pour la semaine, on prend la semaine actuelle
      const semaineActuelle = getWeekNumber(new Date());
      coursFiltres = coursFiltres.filter(cours => cours.semaine === semaineActuelle);
    } else if (periodeActuelle === 'mois') {
      coursFiltres = coursFiltres.filter(cours => 
        semaineAppartientAuMois(cours.semaine, moisSelectionne, anneeSelectionnee)
      );
    } else if (periodeActuelle === 'annee') {
      coursFiltres = coursFiltres.filter(cours => 
        cours.annee === anneeSelectionnee
      );
    }

    // Filtrer par classe si une classe est sélectionnée
    if (selectedClasse && selectedClasse !== '') {
      const selectedClasseObj = classes.find(c => c._id === selectedClasse);
      if (selectedClasseObj) {
        coursFiltres = coursFiltres.filter(cours => cours.classe === selectedClasseObj.nom);
      }
    }

    // Calculer le nombre de cours par matière
    const matiereCount = {};
    coursFiltres.forEach(cours => {
      if (cours.matiere) {
        matiereCount[cours.matiere] = (matiereCount[cours.matiere] || 0) + 1;
      }
    });

    // Convertir en tableau pour le graphique
    const donnees = Object.entries(matiereCount).map(([name, value]) => ({
      name,
      value
    }));

    setCoursParMatiere(donnees);
  };

  // Mettre à jour les cours par matière quand les filtres changent
  useEffect(() => {
    if (cours.length > 0) {
      calculerCoursParMatiere(cours, periode);
    }
  }, [cours, periode, moisSelectionne, anneeSelectionnee, selectedClasse]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 4,
        p: 3,
        '@media (max-width: 768px)': {
          p: 1,
          gap: 2
        }
      }}>
        <Typography variant="h4" gutterBottom sx={{
          '@media (max-width: 768px)': {
            fontSize: '1.5rem',
            textAlign: 'center'
          }
        }}>
          {t('statistics.title')}
        </Typography>

        {/* Graphique des cours par matière */}
        <Card>
          <CardHeader
            title={t('statistics.coursesBySubject')}
            subheader={t('statistics.coursesBySubjectDescription')}
            action={
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  gap: 1,
                  width: '100%'
                }
              }}>
                <FormControl size="small" sx={{ 
                  minWidth: 200,
                  '@media (max-width: 768px)': {
                    minWidth: '100%',
                    width: '100%'
                  }
                }}>
                  <InputLabel>{t('statistics.class')}</InputLabel>
                  <Select
                    value={selectedClasse}
                    onChange={(e) => setSelectedClasse(e.target.value)}
                    label={t('statistics.class')}
                  >
                    <MenuItem value="">{t('statistics.allClasses')}</MenuItem>
                    {classes.map((classe) => (
                      <MenuItem key={classe._id} value={classe._id}>
                        {classe.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ 
                  minWidth: 120,
                  '@media (max-width: 768px)': {
                    minWidth: '100%',
                    width: '100%'
                  }
                }}>
                  <InputLabel>{t('statistics.period')}</InputLabel>
                  <Select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    label={t('statistics.period')}
                  >
                    <MenuItem value="semaine">{t('statistics.week')}</MenuItem>
                    <MenuItem value="mois">{t('statistics.month')}</MenuItem>
                    <MenuItem value="annee">{t('statistics.year')}</MenuItem>
                  </Select>
                </FormControl>
                {periode === 'mois' && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('statistics.month')}</InputLabel>
                    <Select
                      value={moisSelectionne}
                      onChange={(e) => setMoisSelectionne(e.target.value)}
                      label={t('statistics.month')}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString(i18n.language, { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {periode === 'annee' && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('statistics.year')}</InputLabel>
                    <Select
                      value={anneeSelectionnee}
                      onChange={(e) => setAnneeSelectionnee(e.target.value)}
                      label={t('statistics.year')}
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
              </Box>
            }
          />
          <CardContent>
            {coursParMatiere.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  height={400}
                  data={coursParMatiere}
                  margin={{ 
                    top: 20, 
                    right: 30, 
                    left: 20, 
                    bottom: 60,
                    '@media (max-width: 768px)': {
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 80
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    label={{ 
                      value: t('statistics.subject'), 
                      position: 'insideBottomRight', 
                      offset: -10 
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    sx={{
                      '@media (max-width: 768px)': {
                        fontSize: '10px'
                      }
                    }}
                  />
                  <YAxis 
                    label={{ 
                      value: t('statistics.courses'), 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: 0 
                    }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} ${t('statistics.courses')}`, name]}
                    labelFormatter={(label) => `${t('statistics.subject')} ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8"
                    name={t('statistics.courses')}
                  >
                    {coursParMatiere.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Typography variant="h6" color="text.secondary">
                  {t('statistics.noData')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Graphique des cours par enseignant */}
        <Card>
          <CardHeader
            title={t('statistics.coursesByTeacher')}
            subheader={t('statistics.coursesByTeacherDescription')}
            action={
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  gap: 1,
                  width: '100%'
                }
              }}>
                <FormControl size="small" sx={{ 
                  minWidth: 200,
                  '@media (max-width: 768px)': {
                    minWidth: '100%',
                    width: '100%'
                  }
                }}>
                  <InputLabel>{t('statistics.teachers')}</InputLabel>
                  <Select
                    multiple
                    value={selectedEnseignants}
                    onChange={(e) => setSelectedEnseignants(e.target.value)}
                    label={t('statistics.teachers')}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {enseignants.map((enseignant) => (
                      <MenuItem key={enseignant._id} value={`${enseignant.nom} ${enseignant.prenom}`}>
                        {enseignant.nom} {enseignant.prenom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ 
                  minWidth: 120,
                  '@media (max-width: 768px)': {
                    minWidth: '100%',
                    width: '100%'
                  }
                }}>
                  <InputLabel>{t('statistics.period')}</InputLabel>
                  <Select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    label={t('statistics.period')}
                  >
                    <MenuItem value="semaine">{t('statistics.week')}</MenuItem>
                    <MenuItem value="mois">{t('statistics.month')}</MenuItem>
                    <MenuItem value="annee">{t('statistics.year')}</MenuItem>
                  </Select>
                </FormControl>
                {periode === 'mois' && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('statistics.month')}</InputLabel>
                    <Select
                      value={moisSelectionne}
                      onChange={(e) => setMoisSelectionne(e.target.value)}
                      label={t('statistics.month')}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString(i18n.language, { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {periode === 'annee' && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t('statistics.year')}</InputLabel>
                    <Select
                      value={anneeSelectionnee}
                      onChange={(e) => setAnneeSelectionnee(e.target.value)}
                      label={t('statistics.year')}
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
              </Box>
            }
          />
          <CardContent>
            {coursParPeriode.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  height={400}
                  data={coursParPeriode}
                  margin={{ 
                    top: 20, 
                    right: 30, 
                    left: 20, 
                    bottom: 60,
                    '@media (max-width: 768px)': {
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 80
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    label={{ 
                      value: t('statistics.teacher'), 
                      position: 'insideBottomRight', 
                      offset: -10 
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    sx={{
                      '@media (max-width: 768px)': {
                        fontSize: '10px'
                      }
                    }}
                  />
                  <YAxis 
                    label={{ 
                      value: t('statistics.courses'), 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: 0 
                    }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} ${t('statistics.courses')}`, name]}
                    labelFormatter={(label) => `${t('statistics.teacher')} ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8"
                    name={t('statistics.courses')}
                  >
                    {coursParPeriode.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Typography variant="h6" color="text.secondary">
                  {t('statistics.noData')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Statistiques; 