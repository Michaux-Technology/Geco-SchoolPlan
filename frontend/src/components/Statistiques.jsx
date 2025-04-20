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
  OutlinedInput
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import io from 'socket.io-client';

// Connexion au serveur Socket.IO
const socket = io('http://localhost:5000');

// Tableau de couleurs pour les différentes lignes du graphique
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const Statistiques = () => {
  const { t } = useTranslation();
  
  // États pour les données
  const [enseignants, setEnseignants] = useState([]);
  const [cours, setCours] = useState([]);
  const [selectedEnseignants, setSelectedEnseignants] = useState([]);
  const [coursParPeriode, setCoursParPeriode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enseignantsCourbes, setEnseignantsCourbes] = useState({});
  const [error, setError] = useState(null);
  
  // État pour la période sélectionnée
  const [periode, setPeriode] = useState('semaine');
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth() + 1); // 1-12
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());

  useEffect(() => {
    // Charger les enseignants et les cours depuis le serveur
    setLoading(true);
    socket.emit('getEnseignants');
    socket.emit('getCours');
    
    // Écouteurs pour les données reçues
    socket.on('enseignantsUpdate', (data) => {
      setEnseignants(data);
    });

    socket.on('coursUpdate', (data) => {
      setCours(data);
    });

    socket.on('error', (error) => {
      setError(error);
    });

    // Nettoyer les écouteurs
    return () => {
      socket.off('enseignantsUpdate');
      socket.off('coursUpdate');
      socket.off('error');
    };
  }, []);

  // Fonction pour obtenir le numéro de mois à partir de la semaine
  const getMoisFromSemaine = (semaine) => {
    // Approximation: chaque mois a environ 4 semaines
    return Math.ceil(semaine / 4);
  };

  // Fonction pour calculer si une semaine appartient au mois sélectionné
  const semaineAppartientAuMois = (semaine, mois) => {
    const moisDeLaSemaine = getMoisFromSemaine(semaine);
    return moisDeLaSemaine === mois;
  };

  // Fonction pour calculer les cours dispensés pour plusieurs enseignants
  const calculerCoursDispenses = (enseignantsList, coursData = cours, periodeActuelle = periode) => {
    if (!coursData || coursData.length === 0 || !enseignantsList || enseignantsList.length === 0) {
      setCoursParPeriode([]);
      setEnseignantsCourbes({});
      return;
    }

    // Stocker les données de tous les enseignants
    const enseignantsData = {};
    
    // Calculer les données pour chaque enseignant
    enseignantsList.forEach(nomCompletEnseignant => {
      const [nom, prenom] = nomCompletEnseignant.split(' ');
      
      // Filtrer les cours par enseignant et exclure les cours annulés
      const coursDeLEnseignant = coursData.filter(cours => {
        if (!cours.enseignants || cours.annule) return false;
        return cours.enseignants.some(e => e.nom === nom);
      });
      
      // Filtrer par période si nécessaire
      let coursFiltres = coursDeLEnseignant;
      
      if (periodeActuelle === 'mois') {
        // Filtrer les cours du mois sélectionné
        coursFiltres = coursDeLEnseignant.filter(cours => 
          semaineAppartientAuMois(cours.semaine, moisSelectionne)
        );
      } else if (periodeActuelle === 'annee') {
        // Filtrer les cours de l'année sélectionnée
        coursFiltres = coursDeLEnseignant.filter(cours => 
          (cours.annee || new Date().getFullYear()) === anneeSelectionnee
        );
      }
      
      // Regrouper par semaine
      const coursParSemaine = {};
      
      coursFiltres.forEach(cours => {
        const semaine = cours.semaine;
        
        if (!coursParSemaine[semaine]) {
          coursParSemaine[semaine] = 0;
        }
        
        coursParSemaine[semaine] += 1;
      });
      
      // Stocker les données de cet enseignant
      enseignantsData[nomCompletEnseignant] = coursParSemaine;
    });
    
    // Collecter toutes les semaines uniques de tous les enseignants
    const toutesLesSemaines = new Set();
    Object.values(enseignantsData).forEach(data => {
      Object.keys(data).forEach(semaine => {
        toutesLesSemaines.add(parseInt(semaine));
      });
    });
    
    // Trier les semaines
    const semainesTriees = [...toutesLesSemaines].sort((a, b) => a - b);
    
    // Créer le tableau de données pour le graphique
    const donnees = semainesTriees.map(semaine => {
      const point = {
        semaine: semaine,
        label: `${t('statistics.week')} ${semaine}`
      };
      
      // Ajouter les données de chaque enseignant
      Object.keys(enseignantsData).forEach(nomEnseignant => {
        const coursCount = enseignantsData[nomEnseignant][semaine] || 0;
        point[nomEnseignant] = coursCount;
      });
      
      return point;
    });
    
    setCoursParPeriode(donnees.length > 0 ? donnees : []);
    setEnseignantsCourbes(enseignantsData);
  };

  useEffect(() => {
    if (selectedEnseignants.length > 0 && cours.length > 0) {
      calculerCoursDispenses(selectedEnseignants, cours, periode);
    } else {
      setCoursParPeriode([]);
      setEnseignantsCourbes({});
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
          <Typography>{t('statistics.noDataAvailable')}</Typography>
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
            dataKey="semaine" 
            label={{ 
              value: t('statistics.week'), 
              position: 'insideBottomRight', 
              offset: -10 
            }} 
          />
          <YAxis 
            label={{ 
              value: t('statistics.courses'), 
              angle: -90, 
              position: 'insideLeft', 
              offset: -5 
            }} 
          />
          <Tooltip 
            formatter={(value, name) => [`${value} ${t('statistics.courses')}`, name]}
            labelFormatter={(label) => `${t('statistics.week')} ${label}`}
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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 2,
        width: '100%',
        px: 3,
        alignItems: 'center'
      }}>
        <Typography variant="h5" color="primary" sx={{ mt: 2, mb: 3 }}>
          {t('navigation.statistics')}
        </Typography>
      </Box>

      {/* Graphique des cours dispensés par un enseignant */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Card elevation={3} sx={{ width: '100%', borderRadius: 0 }}>
          <CardHeader 
            title={getGraphTitle()} 
            sx={{ 
              backgroundColor: 'primary.light', 
              color: 'white',
              p: 2
            }}
          />
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              mb: 2,
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <FormControl sx={{ minWidth: 300, maxWidth: 600 }}>
                <InputLabel>{t('statistics.selectTeachers')}</InputLabel>
                <Select
                  multiple
                  value={selectedEnseignants}
                  onChange={handleEnseignantsChange}
                  input={<OutlinedInput id="select-multiple-teachers" label={t('statistics.selectTeachers')} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  disabled={loading || enseignants.length === 0}
                >
                  {getEnseignantItems()}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>{t('statistics.period')}</InputLabel>
                <Select
                  value={periode}
                  onChange={handlePeriodeChange}
                  label={t('statistics.period')}
                >
                  <MenuItem value="semaine">{t('statistics.week')}</MenuItem>
                  <MenuItem value="mois">{t('statistics.month')}</MenuItem>
                  <MenuItem value="annee">{t('statistics.year')}</MenuItem>
                </Select>
              </FormControl>

              {periode === 'mois' && (
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>{t('statistics.selectMonth')}</InputLabel>
                  <Select
                    value={moisSelectionne}
                    onChange={handleMoisChange}
                    label={t('statistics.selectMonth')}
                  >
                    {getMoisItems()}
                  </Select>
                </FormControl>
              )}

              {periode === 'annee' && (
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>{t('statistics.selectYear')}</InputLabel>
                  <Select
                    value={anneeSelectionnee}
                    onChange={handleAnneeChange}
                    label={t('statistics.selectYear')}
                  >
                    {getAnneeItems()}
                  </Select>
                </FormControl>
              )}
            </Box>
            
            <Box sx={{ height: 500, width: '100%' }}>
              {renderGraph()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Statistiques; 