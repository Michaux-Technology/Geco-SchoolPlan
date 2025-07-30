import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Comment as CommentIcon,
  ContentCopy as ContentCopyIcon,
  ContentPaste as ContentPasteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './Planning.css';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import AddCourseModal from './planning/AddCourseModal';
import DeleteCourseModal from './planning/DeleteCourseModal';
import AddSurveillanceModal from './planning/AddSurveillanceModal';
import EditCommentModal from './planning/EditCommentModal';
import PlanningFilters from './planning/PlanningFilters';
import WeekSelector from './planning/WeekSelector';
import AnnotationEditor from './planning/AnnotationEditor';

function Planning() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const socket = useRef(null);

  // Fonction pour convertir le jour traduit vers le format français pour la base de données
  const convertToFrenchDay = (translatedDay) => {
    // Vérifier si le paramètre est valide
    if (!translatedDay) {
      console.warn('convertToFrenchDay: jour non défini ou invalide', { translatedDay });
      return 'Lundi'; // Valeur par défaut
    }

    // Vérifier si le jour est déjà en français
    const joursFrancais = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    if (joursFrancais.includes(translatedDay)) {
      return translatedDay;
    }

    try {
      // Créer un mapping pour chaque langue possible
      const dayMappings = {
        // Français (clés i18n)
        [t('planning.days.monday')]: 'Lundi',
        [t('planning.days.tuesday')]: 'Mardi',
        [t('planning.days.wednesday')]: 'Mercredi',
        [t('planning.days.thursday')]: 'Jeudi',
        [t('planning.days.friday')]: 'Vendredi',
        
        // Anglais
        'Monday': 'Lundi',
        'Tuesday': 'Mardi',
        'Wednesday': 'Mercredi',
        'Thursday': 'Jeudi',
        'Friday': 'Vendredi'
      };

      // Ajouter des mappings pour d'autres langues si nécessaire
      if (i18n.language === 'de') {
        Object.assign(dayMappings, {
          'Montag': 'Lundi',
          'Dienstag': 'Mardi',
          'Mittwoch': 'Mercredi',
          'Donnerstag': 'Jeudi',
          'Freitag': 'Vendredi'
        });
      }

      // Si le jour est déjà en français ou traduit, on le convertit
      const result = dayMappings[translatedDay];
      
      if (!result) {
        console.warn('Jour non trouvé dans les mappings:', {
          jourRecu: translatedDay,
          langue: i18n.language,
          mappingsDisponibles: Object.keys(dayMappings)
        });
        // Si pas de correspondance trouvée, retourner le jour tel quel
        return translatedDay;
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la conversion du jour:', error);
      return translatedDay; // En cas d'erreur, retourner le jour tel quel
    }
  };

  // Fonction pour convertir le jour français vers le jour traduit dans l'interface
  const convertFromFrenchDay = (frenchDay) => {
    const dayMappings = {
      'Lundi': 'planning.days.monday',
      'Mardi': 'planning.days.tuesday',
      'Mercredi': 'planning.days.wednesday',
      'Jeudi': 'planning.days.thursday',
      'Vendredi': 'planning.days.friday'
    };
    const translatedKey = dayMappings[frenchDay] || frenchDay;
    const result = t(translatedKey);
    return result;
  };

  // Jours traduits avec i18next
  const jours = [
    t('planning.days.monday'), 
    t('planning.days.tuesday'), 
    t('planning.days.wednesday'), 
    t('planning.days.thursday'), 
    t('planning.days.friday')
  ];

  // Effet pour recharger les données quand la langue change
  useEffect(() => {
    if (socket.current) {
      socket.current.emit('getCours');
      socket.current.emit('getSurveillances');
    }
  }, [i18n.language]);

  const [surveillances, setSurveillances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customTime, setCustomTime] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    classe: '',
    enseignants: [],
    matiere: '',
    salle: '',
    jour: '',
    uhr: '',
    semaine: 1,
    commentaire: ''
  });
  const [error, setError] = useState('');
  const [isAddTimeModalOpen, setIsAddTimeModalOpen] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    nummer: '',
    zeitslot: ''
  });
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [newSlot, setNewSlot] = useState({
    enseignant: '',
    matiere: '',
    salle: '',
    jour: '',
    zeitslot: ''
  });

  const [newSurveillance, setNewSurveillance] = useState({
    enseignant: '',
    lieu: '',
    jour: '',
    position: 0,
    zeitslot: null
  });

  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuSlot, setContextMenuSlot] = useState(null);
  const [cours, setCours] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [uhrs, setUhrs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCours, setNewCours] = useState({
    classe: '',
    enseignant: '',
    matiere: '',
    salle: '',
    jour: '',
    heure: '',
    semaine: 1
  });

  const [selectedCours, setSelectedCours] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSurveillanceModal, setShowSurveillanceModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replacementData, setReplacementData] = useState({
    enseignant: '',
    enseignants: [],
    matiere: '',
    salle: ''
  });

  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedEnseignant, setSelectedEnseignant] = useState('');
  const [annotations, setAnnotations] = useState({});
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [copiedWeekCourses, setCopiedWeekCourses] = useState(null);
  const [copiedWeekData, setCopiedWeekData] = useState(null);
  const [showPasteConfirmation, setShowPasteConfirmation] = useState(false);
  const [modelWeeks, setModelWeeks] = useState([]);
  const [showSaveModelDialog, setShowSaveModelDialog] = useState(false);
  const [modelName, setModelName] = useState('');
  const [showModelSelectionDialog, setShowModelSelectionDialog] = useState(false);
  const [selectedModelWeek, setSelectedModelWeek] = useState(null);
  const [showAllSalles, setShowAllSalles] = useState(false);
  const [showAllEnseignants, setShowAllEnseignants] = useState(false);
  const [openSurveillanceModal, setOpenSurveillanceModal] = useState(false);

  // États pour l'édition des commentaires
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const heures = ['7:45 - 8:25', '8:25 - 9:05', '9:05 - 9:45', '9:45 - 10:25', '10:25 - 11:05', '11:05 - 11:45', '11:45 - 12:25'];

  // Styles pour les en-têtes de tableau
  const tableHeaderStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    fontWeight: 'bold',
    padding: '12px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0'
  };

  const currentDayStyle = {
    fontWeight: 'bold',
    backgroundColor: '#42a5f5',
    color: 'white'
  };

  // Fonction pour déterminer si un jour est le jour actuel
  const isCurrentDay = (index) => {
    const currentDate = new Date();
    const weekDates = getWeekDates();
    const cellDate = new Date(currentWeek);
    cellDate.setDate(cellDate.getDate() - cellDate.getDay() + 1 + index); // Lundi + index
    return currentDate.toDateString() === cellDate.toDateString();
  };

  // Fonction pour obtenir le numéro de la semaine
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const getWeekDates = () => {
    const dates = [];
    const currentDate = new Date(currentWeek);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Lundi

    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    }
    return dates;
  };

  // Effet pour mettre à jour les annotations lorsque la semaine change
  useEffect(() => {
    if (socket.current) {
      // Créer une nouvelle date avec l'année et la semaine correctes
      const date = new Date(currentWeek);
      const weekNumber = getWeekNumber(date);
      const year = date.getFullYear();
      
      // Envoyer les données au format attendu
      const data = {
        semaine: weekNumber,
        annee: year
      };
      
      socket.current.emit('getAnnotations', data);
    }
  }, [currentWeek]);

  // Ajouter un intervalle pour mettre à jour l'heure actuelle
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isComponentMounted = true;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000;

    const initializeSocket = () => {
      if (!socket.current && isComponentMounted) {
        const apiUrl = import.meta.env.VITE_API_URL;
        
        if (!apiUrl) {
          console.error('L\'URL de l\'API n\'est pas définie. Veuillez configurer VITE_API_URL dans le fichier .env');
          return;
        }

        try {
          socket.current = io(apiUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: RECONNECT_DELAY,
            withCredentials: true,
            timeout: 10000,
            forceNew: true
          });

          socket.current.on('connect', () => {
            reconnectAttempts = 0;
            if (isComponentMounted) {
              sendInitialRequests();
            }
          });

          socket.current.on('connect_error', (error) => {
            console.error('Erreur de connexion socket:', error.message);
            console.error('Détails de l\'erreur:', error);
            reconnectAttempts++;
            
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
              console.error('Nombre maximum de tentatives de reconnexion atteint');
              socket.current?.disconnect();
            }
          });

          socket.current.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
              // Le serveur a forcé la déconnexion, on essaie de se reconnecter
              socket.current?.connect();
            }
          });

          socket.current.on('reconnect', (attemptNumber) => {
            if (isComponentMounted) {
              sendInitialRequests();
            }
          });

          socket.current.on('reconnect_error', (error) => {
            console.error('Erreur de reconnexion:', error.message);
          });

          socket.current.on('reconnect_failed', () => {
            console.error('Échec de la reconnexion après toutes les tentatives');
          });

          socket.current.on('error', (error) => {
            console.error('Erreur socket générale:', error);
          });

          // Configuration des écouteurs pour les données
          configureSocketListeners();
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de Socket.IO:', error);
        }
      }
    };

    initializeSocket();

    return () => {
      isComponentMounted = false;
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  const sendInitialRequests = () => {
    if (!socket.current?.connected) {
      return;
    }
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    socket.current.emit('getPlanning', { semaine: currentWeek, annee: currentYear });
    socket.current.emit('getSurveillances', { semaine: currentWeek, annee: currentYear });
    socket.current.emit('getUhrs');
    socket.current.emit('getEnseignants');
    socket.current.emit('getCours');
    socket.current.emit('getClasses');
    socket.current.emit('getMatieres');
    socket.current.emit('getSalles');
    socket.current.emit('getAnnotations', { semaine: currentWeek, annee: currentYear });
  };

  // Récupérer les semaines modèles stockées au chargement
  useEffect(() => {
    const savedModels = localStorage.getItem('planningModelWeeks');
    if (savedModels) {
      try {
        setModelWeeks(JSON.parse(savedModels));
      } catch (e) {
        console.error('Erreur lors du chargement des modèles de semaine:', e);
        localStorage.removeItem('planningModelWeeks');
      }
    }
  }, []);

  // Sauvegarder les modèles dans le localStorage quand ils changent
  useEffect(() => {
    if (modelWeeks.length > 0) {
      localStorage.setItem('planningModelWeeks', JSON.stringify(modelWeeks));
    }
  }, [modelWeeks]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      enseignant: slot.enseignant || '',
      matiere: slot.matiere || '',
      salle: slot.salle || '',
      jour: slot.jour || '',
      zeitslot: slot.uhr.zeitslot || '',
      uhr: slot.uhr._id || '',
      semaine: getWeekNumber(currentWeek)
    });
  };

  const handleTimeClick = (zeitslot, jour) => {
    const updatedSlot = {
      ...zeitslot,
      jour: jour
    };
    socket.emit('updateTimeSlot', updatedSlot);
  };

  const handleTimeChange = () => {
    if (!selectedTime) return;

    // Vérifier le format de l'heure (HH:MM - HH:MM)
    const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] - ([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(customTime)) {
      setError('Format d\'heure invalide. Utilisez le format HH:MM - HH:MM');
      return;
    }

    // Créer le slot mis à jour
    const updatedSlot = {
      uhr: selectedTime.zeitslot._id,
      zeitslot: customTime
    };

    socket.current.emit('updateSlot', updatedSlot);
    
    // Fermer le modal et réinitialiser les états
    setIsTimeModalOpen(false);
    setCustomTime('');
    setError('');
    setSelectedTime(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSlot) {
      socket.current.emit('updateSlot', {
        ...formData,
        id: selectedSlot.id
      });
      setSelectedSlot(null);
    }
  };

  const handleDelete = () => {
    if (selectedSlot) {
      socket.current.emit('deleteSlot', selectedSlot.id);
      setSelectedSlot(null);
    }
  };

  const handleAddTimeSlot = (newTimeSlot) => {
    socket.emit('addTimeSlot', newTimeSlot, (message) => {
      if (message.success) {
        setTimeSlots(prev => [...prev, newTimeSlot]);
      }
    });
  };

  const handleDeleteTimeSlot = (zeitslot) => {
    socket.emit('deleteTimeSlot', zeitslot, (message) => {
      if (message.success) {
        setTimeSlots(prev => prev.filter(ts => ts._id !== zeitslot._id));
      }
    });
  };

  // Fonction pour naviguer entre les semaines
  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  // Fonction pour vérifier si une cellule correspond à l'heure actuelle
  const isCurrentTimeSlot = (zeitslot, jour) => {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentDay = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][currentTime.getDay()];
    
    // Vérifier si c'est le jour actuel
    if (currentDay !== jour) return false;

    // Extraire les heures de début et de fin du créneau horaire
    const [startTime, endTime] = zeitslot.zeitslot.split(' - ');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Convertir en minutes pour faciliter la comparaison
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  };

  const handleCellClick = (jour, uhrId, isSurveillance = false, position = -1) => {
    if (isSurveillance) {
      const selectedUhr = uhrs.find(u => u._id === uhrId);
      setSelectedCell({ jour, zeitslot: selectedUhr, isSurveillance, position });
      setNewSurveillance({
        enseignant: '',
        lieu: '',
        jour: jour,
        position: position,
        zeitslot: selectedUhr
      });
      setShowSurveillanceModal(true);
    } else {
      const selectedUhr = uhrs.find(u => u._id === uhrId);
      if (!selectedUhr) {
        console.error('Créneau horaire non trouvé:', uhrId);
        enqueueSnackbar('Erreur: Créneau horaire non trouvé', { variant: 'error' });
        return;
      }
      
      setSelectedCell({ jour, zeitslot: selectedUhr });
      setFormData({
        classe: '',
        enseignants: [],
        matiere: '',
        salle: '',
        jour: jour,
        uhr: uhrId,
        semaine: getWeekNumber(currentWeek)
      });
      setError('');
      setIsAddModalOpen(true);
    }
  };

  const handleAddSlot = () => {
    if (!newSlot.enseignant || !newSlot.matiere || !newSlot.salle) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Obtenir le numéro de semaine actuel
    const currentWeekNumber = getWeekNumber(currentWeek);

    // Créer le nouveau slot avec toutes les informations nécessaires
    const slotData = {
      ...newSlot,
      semaine: currentWeekNumber
    };

    
    // Ajouter un gestionnaire d'événements pour le succès
    socket.current.once('success', (message) => {
      enqueueSnackbar(t('planning.courseAdded', 'Cours ajouté avec succès'), { variant: 'success' });
      setIsAddSlotModalOpen(false);
      setNewSlot({
        enseignant: '',
        matiere: '',
        salle: '',
        jour: '',
        zeitslot: ''
      });
      setError('');
    });

    // Ajouter un gestionnaire d'événements pour l'erreur
    socket.current.once('error', (errorMessage) => {
      console.error('Erreur lors de l\'ajout du cours:', errorMessage);
      setError(errorMessage || 'Erreur lors de l\'ajout du cours');
      enqueueSnackbar(t('planning.courseAddError', 'Erreur lors de l\'ajout du cours'), { variant: 'error' });
    });

    if (selectedCell.slot) {
      // Si on modifie un cours existant
      socket.current.emit('updateSlot', {
        ...slotData,
        id: selectedCell.slot._id
      });
    } else {
      // Si on ajoute un nouveau cours
      socket.current.emit('addSlot', slotData);
    }
  };

  const handleContextMenu = (event, slot, jour, zeitslot, isSurveillance = false) => {
    event.preventDefault();
    setContextMenuSlot({ slot, jour, zeitslot, isSurveillance });
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextMenuSlot(null);
  };

  const handleDeleteFromContextMenu = () => {
    if (contextMenuSlot) {
      if (contextMenuSlot.isSurveillance) {
        socket.current.emit('deleteSurveillance', contextMenuSlot.slot._id);
      } else {
        socket.current.emit('deleteSlot', contextMenuSlot.slot._id);
      }
      handleCloseContextMenu();
    }
  };

  // Fonction pour convertir l'heure au format de la base de données
  const convertHeureToDBFormat = (heure) => {
    // Si l'heure est déjà au format "8h", on la retourne telle quelle
    if (heure.endsWith('h')) {
      return heure;
    }
    // Sinon, on extrait l'heure de début du format "8h-9h"
    return heure.split('-')[0];
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    // Vérifier si c'est une surveillance ou un cours
    const isSurveillance = surveillances.some(s => s._id === draggableId);
    
    if (isSurveillance) {
      // Gestion des surveillances
      const surveillance = surveillances.find(s => s._id === draggableId);
      if (!surveillance) return;

      // Vérifier si la destination est une zone de surveillance valide
      const destinationId = destination.droppableId;
      const isSurveillanceZone = destinationId.includes('before') || 
                                 destinationId.includes('after') || 
                                 /^[^-]+-\d+$/.test(destinationId); // Format: jour-index (sans uhr._id)

      if (!isSurveillanceZone) {
        console.warn('Tentative de glisser une surveillance dans une zone de cours non autorisée:', destinationId);
        enqueueSnackbar(t('planning.surveillanceDropError', 'Les surveillances ne peuvent être glissées que dans les zones de surveillance'), { variant: 'error' });
        return;
      }

      const sourceDay = source.droppableId.split('-')[0];
      const destinationDay = destination.droppableId.split('-')[0];
      
      let newPosition = -1;
      if (destination.droppableId.includes('before')) {
        newPosition = -1;
      } else if (destination.droppableId.includes('after')) {
        newPosition = uhrs.length;
      } else {
        // Pour les positions entre les heures, utiliser l'index de la ligne
        newPosition = parseInt(destination.droppableId.split('-')[1]) || 0;
      }

      const updatedSurveillance = {
        ...surveillance,
        jour: convertToFrenchDay(destinationDay),
        uhr: uhrs.find(u => u._id === destination.droppableId.split('-')[2])?._id,
        position: newPosition,
        before: newPosition === -1 ? true : false
      };

      socket.current.emit('updateSurveillance', updatedSurveillance);
    } else {
      // Gestion des cours
      const coursToMove = cours.find(c => c._id === draggableId);
      if (!coursToMove) return;

      // Vérifier si la destination est une zone de cours valide
      const destinationId = destination.droppableId;
      const isCourseZone = /^[^-]+-[a-zA-Z0-9]+$/.test(destinationId) && 
                          !destinationId.includes('before') && 
                          !destinationId.includes('after') &&
                          !/^[^-]+-\d+$/.test(destinationId); // Pas le format jour-index

      if (!isCourseZone) {
        console.warn('Tentative de glisser un cours dans une zone de surveillance non autorisée:', destinationId);
        enqueueSnackbar(t('planning.courseDropError', 'Les cours ne peuvent être glissés que dans les zones de cours'), { variant: 'error' });
        return;
      }

      const [sourceDay, sourceUhrId] = source.droppableId.split('-');
      const [destinationDay, destinationUhrId] = destination.droppableId.split('-');

      const destinationUhr = uhrs.find(u => u._id === destinationUhrId);
      if (!destinationUhr) return;

      // S'assurer que les IDs des enseignants sont présents
      const updatedCours = {
        ...coursToMove,
        jour: convertToFrenchDay(destinationDay),
        heure: `${destinationUhr.start} - ${destinationUhr.ende}`,
        uhr: destinationUhrId,
        enseignantsIds: coursToMove.enseignants?.map(enseignant => {
          const enseignantObj = enseignants.find(e => e.nom === enseignant);
          return enseignantObj ? enseignantObj._id : null;
        })
      };

      socket.current.emit('updateCours', updatedCours);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      classe: '',
      enseignants: [],
      matiere: '',
      salle: '',
      jour: selectedCell?.jour || '',
      uhr: selectedCell?.zeitslot?._id || '',
      semaine: getWeekNumber(currentWeek)
    });
    setError('');
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setError('');
  };

  const handleSubmitModal = () => {
    // Vérification des champs requis
    if (!formData.classe || !formData.enseignants || formData.enseignants.length === 0 || !formData.matiere || !formData.salle) {
      setError('Tous les champs sont requis');
      return;
    }

    // Vérification du jour et de l'heure
    if (!selectedCell?.jour || !selectedCell?.zeitslot?._id) {
      setError('Jour et créneau horaire non définis');
      return;
    }

    const uhr = uhrs.find(u => u._id === selectedCell.zeitslot._id);
    if (!uhr) {
      setError('Créneau horaire non trouvé');
      return;
    }

    // S'assurer que la liste des enseignants n'est jamais vide
    const enseignantsList = formData.enseignants.length > 0 ? formData.enseignants : ['Non assigné'];

    // Convertir le jour traduit en jour français pour la base de données
    const frenchDay = convertToFrenchDay(selectedCell.jour);

    const coursData = {
      classe: formData.classe,
      enseignants: enseignantsList,
      enseignantsIds: enseignantsList.map(enseignant => {
        const enseignantObj = enseignants.find(e => e.nom === enseignant);
        return enseignantObj ? enseignantObj._id : null;
      }),
      matiere: formData.matiere,
      salle: formData.salle,
      jour: frenchDay,
      heure: `${uhr.start} - ${uhr.ende}`,
      uhr: selectedCell.zeitslot._id,
      semaine: getWeekNumber(currentWeek),
      annee: currentWeek.getFullYear(),
      commentaire: formData.commentaire || ''
    };

    // Fermer le modal immédiatement
    setIsAddModalOpen(false);
    setFormData({
      classe: '',
      enseignants: [],
      matiere: '',
      salle: '',
      jour: '',
      uhr: '',
      semaine: 1,
      commentaire: ''
    });
    setError('');

    if (socket.current?.connected) {
      socket.current.emit('addCours', coursData, (response) => {
        if (response.success) {
          enqueueSnackbar(t('planning.courseAdded', 'Cours ajouté avec succès'), { variant: 'success' });
        } else {
          console.error('Erreur lors de l\'ajout du cours:', response.message);
          enqueueSnackbar(t('planning.courseAddError', 'Erreur lors de l\'ajout du cours'), { variant: 'error' });
        }
      });
    } else {
      enqueueSnackbar(t('planning.connectionError', 'Erreur de connexion au serveur'), { variant: 'error' });
    }
  };

  // Fonction de filtrage des cours
  const getFilteredCours = () => {

    return cours.filter(cours => {
      const matchClasse = !selectedClasse || cours.classe === selectedClasse;
      const enseignantMatch = !selectedEnseignant || cours.enseignants?.some(e => e.id === selectedEnseignant);
      
      return matchClasse && enseignantMatch;
    });
  };

  // Fonction de filtrage des surveillances
  const getFilteredSurveillances = () => {
    return surveillances.filter(surveillance => {
      // Si aucun enseignant n'est sélectionné, afficher toutes les surveillances
      if (!selectedEnseignant) {
        return true;
      }
      
      // Vérifier si l'enseignant de la surveillance correspond à l'enseignant sélectionné
      // surveillance.enseignant peut être un objet (avec population) ou un ID
      const surveillanceEnseignantId = typeof surveillance.enseignant === 'object' 
        ? surveillance.enseignant._id 
        : surveillance.enseignant;
      
      return surveillanceEnseignantId === selectedEnseignant;
    });
  };

  // Fonction pour obtenir les surveillances filtrées pour une position spécifique
  const getFilteredSurveillancesForPosition = (jour, position, uhrId = null) => {
    const frenchDay = convertToFrenchDay(jour);
    
    return getFilteredSurveillances().filter(s => {
      const surveillanceDay = s.jour.split('-')[0];
      
      // Si uhrId est fourni, vérifier aussi l'uhr
      if (uhrId) {
        return surveillanceDay === frenchDay && 
               s.position === position &&
               s.uhr === uhrId &&
               s.semaine === getWeekNumber(currentWeek) &&
               s.annee === currentWeek.getFullYear();
      } else {
        return surveillanceDay === frenchDay && 
               s.position === position &&
               s.semaine === getWeekNumber(currentWeek) &&
               s.annee === currentWeek.getFullYear();
      }
    }).sort((a, b) => a.ordre - b.ordre);
  };

  const getCoursForCell = (jour, uhrId) => {
    const filteredCours = getFilteredCours();
    const uhr = uhrs.find(u => u._id === uhrId);
    
    // Convertir le jour affiché en jour français pour la comparaison
    const frenchDay = convertToFrenchDay(jour);
    
    return filteredCours.filter(cours => 
      // Le jour dans la base de données est en français, on compare avec frenchDay
      cours.jour === frenchDay && 
      cours.uhr === uhrId && 
      cours.semaine === getWeekNumber(currentWeek) &&
      cours.annee === currentWeek.getFullYear()
    );
  };

  const handleDeleteConfirm = (action) => {
    if (!selectedCours) return;

    switch (action) {
      case 'delete':
        socket.current.emit('deleteCours', selectedCours._id);
        break;
      case 'cancel':
        socket.current.emit('updateCours', {
          _id: selectedCours._id,
          annule: true,
          remplace: false,
          enseignantsIds: selectedCours.enseignants?.map(enseignant => {
            const enseignantObj = enseignants.find(e => e.nom === enseignant);
            return enseignantObj ? enseignantObj._id : null;
          })
        });
        break;
      case 'replace':
        const currentEnseignants = Array.isArray(selectedCours.enseignants) 
          ? selectedCours.enseignants 
          : selectedCours.enseignants ? [selectedCours.enseignants] : [];
          
        setReplacementData({
          enseignants: currentEnseignants,
          matiere: selectedCours.matiere,
          salle: selectedCours.salle
        });
        setShowReplaceModal(true);
        return;
    }

    setShowDeleteModal(false);
    setSelectedCours(null);
  };

  const handleReplaceCancel = () => {
    setShowReplaceModal(false);
    setReplacementData({
      enseignant: '',
      enseignants: [],
      matiere: '',
      salle: ''
    });
  };

  const handleReplaceSubmit = () => {
    if (!selectedCours) return;

    // Vérifier si au moins un champ a été modifié
    const currentEnseignants = selectedCours.enseignants?.join(', ') || '';
    const hasChanges = 
      replacementData.enseignants.join(', ') !== currentEnseignants ||
      replacementData.matiere !== selectedCours.matiere ||
      replacementData.salle !== selectedCours.salle;

    if (!hasChanges) {
      enqueueSnackbar(t('planning.noChanges', 'Aucune modification effectuée'), { variant: 'warning' });
      handleReplaceCancel();
      return;
    }

    // Préparer les informations de remplacement
    const remplacementInfo = [];
    if (replacementData.enseignants.join(', ') !== currentEnseignants) {
      remplacementInfo.push(`Enseignant: ${replacementData.enseignants.join(', ')}`);
    }
    if (replacementData.matiere !== selectedCours.matiere) {
      remplacementInfo.push(`Matière: ${replacementData.matiere}`);
    }
    if (replacementData.salle !== selectedCours.salle) {
      remplacementInfo.push(`Salle: ${replacementData.salle}`);
    }

    // Préparation des données mises à jour
    const updatedData = {
      _id: selectedCours._id,
      remplace: true,
      annule: false,
      remplacementInfo: remplacementInfo.join(', '),
      enseignantsIds: replacementData.enseignants.map(enseignant => {
        const enseignantObj = enseignants.find(e => e.nom === enseignant);
        return enseignantObj ? enseignantObj._id : null;
      })
    };
    
    // Si l'enseignant est modifié, mettre à jour les enseignants et leurs IDs
    if (replacementData.enseignants.length > 0 && replacementData.enseignants.join(', ') !== currentEnseignants) {
      updatedData.enseignants = replacementData.enseignants;
    }
    
    // Ajouter les autres champs modifiés
    if (replacementData.matiere !== selectedCours.matiere) {
      updatedData.matiere = replacementData.matiere;
    }
    
    if (replacementData.salle !== selectedCours.salle) {
      updatedData.salle = replacementData.salle;
    }

    // Envoyer la mise à jour
    socket.current.emit('updateCours', updatedData);
    handleReplaceCancel();
  };

  // Fonction pour copier une semaine de planning
  const handleCopyWeek = () => {
    const weekNumber = getWeekNumber(currentWeek);
    const year = currentWeek.getFullYear();
    
    // Filtrer les cours de la semaine actuelle
    const currentWeekCourses = cours.filter(cours => 
      cours.semaine === weekNumber && 
      cours.annee === year
    );
    
    if (currentWeekCourses.length === 0) {
      enqueueSnackbar(t('planning.noCourseInWeek', 'Aucun cours dans cette semaine à copier'), { variant: 'warning' });
      return;
    }
    
    // Stocker les cours et les informations de la semaine
    setCopiedWeekCourses(currentWeekCourses);
    setCopiedWeekData({
      sourceWeek: weekNumber,
      sourceYear: year,
      timestamp: new Date().toISOString()
    });
    
    enqueueSnackbar(t('planning.weekCopied', 'Semaine copiée avec succès'), { variant: 'success' });
  };

  // Fonction pour ouvrir le modal de confirmation de collage
  const handlePasteWeekConfirm = () => {
    if (!copiedWeekCourses || copiedWeekCourses.length === 0) {
      enqueueSnackbar(t('planning.noWeekCopied', 'Aucune semaine n\'a été copiée'), { variant: 'error' });
      return;
    }
    
    setShowPasteConfirmation(true);
  };

  // Fonction pour coller une semaine de planning
  const handlePasteWeek = () => {
    const targetWeekNumber = getWeekNumber(currentWeek);
    const targetYear = currentWeek.getFullYear();
    
    // Vérifier si on essaie de coller dans la même semaine
    if (copiedWeekData.sourceWeek === targetWeekNumber && copiedWeekData.sourceYear === targetYear) {
      enqueueSnackbar(t('planning.cannotPasteSameWeek', 'Impossible de coller dans la même semaine'), { variant: 'error' });
      setShowPasteConfirmation(false);
      return;
    }
    
    // Préparer les nouveaux cours à créer
    const newCourses = copiedWeekCourses.map(oldCours => {
      // Créer une copie sans l'ID et les timestamps pour un nouveau document
      const { _id, createdAt, updatedAt, __v, ...newCours } = oldCours;
      
      // Mettre à jour la semaine et l'année
      newCours.semaine = targetWeekNumber;
      newCours.annee = targetYear;
      
      return newCours;
    });
    
    // Envoyer la demande de copie au serveur
    socket.current.emit('pasteWeek', {
      courses: newCourses,
      targetWeek: targetWeekNumber,
      targetYear: targetYear,
      sourceWeek: copiedWeekData.sourceWeek,
      sourceYear: copiedWeekData.sourceYear
    });
    
    // Écouter la réponse du serveur
    socket.current.once('pasteWeekSuccess', (response) => {
      enqueueSnackbar(t('planning.weekPasted', 'Semaine collée avec succès'), { variant: 'success' });
      // Actualiser les cours après le collage
      socket.current.emit('getCours');
    });
    
    socket.current.once('pasteWeekError', (error) => {
      enqueueSnackbar(error || t('planning.weekPasteError', 'Erreur lors du collage de la semaine'), { variant: 'error' });
    });
    
    setShowPasteConfirmation(false);
  };

  // Fonction pour ouvrir le dialogue de sauvegarde du modèle
  const handleSaveAsModel = () => {
    const weekNumber = getWeekNumber(currentWeek);
    const year = currentWeek.getFullYear();
    
    // Vérifier si des cours existent pour cette semaine
    const currentWeekCourses = cours.filter(cours => 
      cours.semaine === weekNumber && 
      cours.annee === year
    );
    
    // Vérifier si des surveillances existent pour cette semaine
    const currentWeekSurveillances = surveillances.filter(surveillance => 
      surveillance.semaine === weekNumber && 
      surveillance.annee === year
    );
    
    if (currentWeekCourses.length === 0 && currentWeekSurveillances.length === 0) {
      enqueueSnackbar(t('planning.noCourseOrSurveillanceInWeek', 'Aucun cours ou surveillance dans cette semaine à enregistrer comme modèle'), { variant: 'warning' });
      return;
    }
    
    setModelName(`Semaine ${weekNumber} - ${year}`);
    setShowSaveModelDialog(true);
  };

  // Fonction pour sauvegarder la semaine comme modèle
  const handleSaveModelConfirm = () => {
    if (!modelName.trim()) {
      enqueueSnackbar(t('planning.modelNameRequired', 'Un nom est requis pour le modèle'), { variant: 'error' });
      return;
    }
    
    const weekNumber = getWeekNumber(currentWeek);
    const year = currentWeek.getFullYear();
    
    // Vérifier si des cours existent pour cette semaine
    const currentWeekCourses = cours.filter(cours => 
      cours.semaine === weekNumber && 
      cours.annee === year
    );
    
    // Vérifier si des surveillances existent pour cette semaine
    const currentWeekSurveillances = surveillances.filter(surveillance => 
      surveillance.semaine === weekNumber && 
      surveillance.annee === year
    );
    
    // Créer le nouveau modèle
    const newModel = {
      id: Date.now().toString(),
      name: modelName,
      sourceWeek: weekNumber,
      sourceYear: year,
      courses: currentWeekCourses,
      surveillances: currentWeekSurveillances,
      createdAt: new Date().toISOString()
    };
    
    // Vérifier si un modèle avec le même nom existe déjà et le remplacer
    const existingModelIndex = modelWeeks.findIndex(model => model.name === modelName);
    
    if (existingModelIndex !== -1) {
      const updatedModels = [...modelWeeks];
      updatedModels[existingModelIndex] = newModel;
      setModelWeeks(updatedModels);
    } else {
      setModelWeeks([...modelWeeks, newModel]);
    }
    
    setShowSaveModelDialog(false);
    enqueueSnackbar(t('planning.modelSaved', 'Semaine enregistrée comme modèle'), { variant: 'success' });
  };

  // Fonction pour ouvrir le dialogue de sélection de modèle
  const handleOpenModelSelection = () => {
    if (modelWeeks.length === 0) {
      enqueueSnackbar(t('planning.noModelSaved', 'Aucun modèle de semaine n\'est enregistré'), { variant: 'info' });
      return;
    }
    
    setSelectedModelWeek(null);
    setShowModelSelectionDialog(true);
  };

  // Fonction pour appliquer un modèle de semaine
  const handleApplyModel = () => {
    if (!selectedModelWeek) {
      enqueueSnackbar(t('planning.noModelSelected', 'Aucun modèle sélectionné'), { variant: 'error' });
      return;
    }
    
    const targetWeekNumber = getWeekNumber(currentWeek);
    const targetYear = currentWeek.getFullYear();
    
    // Vérifier si on essaie d'appliquer le modèle à la même semaine que la source
    if (selectedModelWeek.sourceWeek === targetWeekNumber && selectedModelWeek.sourceYear === targetYear) {
      enqueueSnackbar(t('planning.cannotApplySameWeek', 'Impossible d\'appliquer le modèle à la semaine source'), { variant: 'error' });
      setShowModelSelectionDialog(false);
      return;
    }
    
    // Préparer les nouveaux cours à créer
    const newCourses = selectedModelWeek.courses.map(oldCours => {
      // Créer une copie sans l'ID et les timestamps pour un nouveau document
      const { _id, createdAt, updatedAt, __v, ...newCours } = oldCours;
      
      // Mettre à jour la semaine et l'année
      newCours.semaine = targetWeekNumber;
      newCours.annee = targetYear;
      
      return newCours;
    });
    
    // Préparer les nouvelles surveillances à créer
    const newSurveillances = (selectedModelWeek.surveillances || []).map(oldSurveillance => {
      // Créer une copie sans l'ID et les timestamps pour un nouveau document
      const { _id, createdAt, updatedAt, __v, ...newSurveillance } = oldSurveillance;
      
      // Mettre à jour la semaine et l'année
      newSurveillance.semaine = targetWeekNumber;
      newSurveillance.annee = targetYear;
      
      return newSurveillance;
    });
    
    // Envoyer la demande d'application de modèle au serveur
    socket.current.emit('pasteWeek', {
      courses: newCourses,
      surveillances: newSurveillances,
      targetWeek: targetWeekNumber,
      targetYear: targetYear,
      sourceWeek: selectedModelWeek.sourceWeek,
      sourceYear: selectedModelWeek.sourceYear
    });
    
    // Écouter la réponse du serveur
    socket.current.once('pasteWeekSuccess', (response) => {
      enqueueSnackbar(t('planning.modelApplied', 'Modèle appliqué avec succès'), { variant: 'success' });
      // Actualiser les cours et surveillances après l'application
      socket.current.emit('getCours');
      socket.current.emit('getSurveillances');
    });
    
    socket.current.once('pasteWeekError', (error) => {
      enqueueSnackbar(error || t('planning.modelApplyError', 'Erreur lors de l\'application du modèle'), { variant: 'error' });
    });
    
    setShowModelSelectionDialog(false);
  };

  // Fonction pour supprimer un modèle de semaine
  const handleDeleteModel = (modelId) => {
    const updatedModels = modelWeeks.filter(model => model.id !== modelId);
    setModelWeeks(updatedModels);
    
    // Si le localStorage est vide, supprimer complètement la clé
    if (updatedModels.length === 0) {
      localStorage.removeItem('planningModelWeeks');
    }
    
    enqueueSnackbar(t('planning.modelDeleted', 'Modèle supprimé'), { variant: 'success' });
  };

  // Fonction pour obtenir les surveillances pour une cellule spécifique
  const getSurveillancesForCell = (jour, uhrId) => {
    // Convertir le jour traduit en français pour la comparaison avec la base de données
    const frenchDay = convertToFrenchDay(jour);
    
    const filteredSurveillances = getFilteredSurveillances();
    
    const cellSurveillances = filteredSurveillances.filter(s => {
      // Extraire uniquement le jour de la surveillance (sans la partie après le tiret si elle existe)
      const surveillanceDay = s.jour.split('-')[0];
      
      const matches = surveillanceDay === frenchDay && 
             s.uhr === uhrId &&
             s.semaine === getWeekNumber(currentWeek) &&
             s.annee === currentWeek.getFullYear();
    
      
      return matches;
    });

    return cellSurveillances.sort((a, b) => a.ordre - b.ordre);
  };

  // Fonction pour obtenir les salles disponibles pour un créneau horaire
  const getSallesDisponibles = (jour, uhrId) => {
    // Si showAllSalles est true, retourner toutes les salles
    if (showAllSalles) {
      return salles;
    }

    // Vérifier si le jour est défini
    if (!jour) {
      console.warn('getSallesDisponibles: jour non défini');
      return salles;
    }

    // Convertir le jour en français
    const frenchDay = convertToFrenchDay(jour);
    if (!frenchDay) {
      console.warn('getSallesDisponibles: conversion du jour a échoué', { jour });
      return salles;
    }

    // Obtenir tous les cours pour ce créneau
    const coursDuCreneau = cours.filter(c => 
      c.jour === frenchDay && 
      c.uhr === uhrId &&
      c.semaine === getWeekNumber(currentWeek) &&
      c.annee === currentWeek.getFullYear() &&
      !c.annule // Exclure les cours annulés
    );
    
    // Extraire les salles déjà utilisées
    const sallesUtilisees = coursDuCreneau.map(c => c.salle).filter(Boolean);
    
    // Retourner les salles qui ne sont pas utilisées
    return salles.filter(s => !sallesUtilisees.includes(s.nom));
  };

  // Fonction pour obtenir les enseignants disponibles pour un créneau horaire
  const getEnseignantsDisponibles = (jour, uhrId) => {
    if (showAllEnseignants) {
      return enseignants;
    }

    const coursDuCreneau = cours.filter(c => 
      c.jour === convertToFrenchDay(jour) && 
      c.uhr === uhrId &&
      c.semaine === getWeekNumber(currentWeek) &&
      c.annee === currentWeek.getFullYear() &&
      !c.annule // Exclure les cours annulés
    );
    
    const enseignantsOccupesIds = coursDuCreneau.reduce((acc, c) => {
      if (c.enseignants) {
        // Extraire les IDs des enseignants du cours
        const ids = c.enseignants.map(e => e.id);
        acc.push(...ids);
      }
      return acc;
    }, []);
    
    return enseignants.filter(e => !enseignantsOccupesIds.includes(e._id));
  };

  // Dans le rendu des surveillances
  const renderSurveillance = (surveillance) => {
    // surveillance.enseignant peut être un objet (avec population) ou un ID
    const nomEnseignant = typeof surveillance.enseignant === 'object' 
      ? surveillance.enseignant.nom 
      : (() => {
          const enseignant = enseignants.find(e => e._id === surveillance.enseignant);
          return enseignant ? enseignant.nom : surveillance.enseignant;
        })();

    return (
      <div className="surveillance-info">
        <span>{nomEnseignant}</span>
        <span>{surveillance.lieu}</span>
      </div>
    );
  };

  // Dans le modal de surveillance
  const handleSurveillanceClick = (surveillance, jour) => {
    setSelectedCours(surveillance);
    setSelectedCell({ 
      jour, 
      zeitslot: uhrs.find(u => u._id === surveillance.uhr),
      isSurveillance: true,
      position: surveillance.position,
      surveillance: surveillance
    });
    setNewSurveillance({
      enseignant: typeof surveillance.enseignant === 'object' ? surveillance.enseignant._id : surveillance.enseignant,
      lieu: surveillance.lieu,
      jour: jour,
      position: surveillance.position,
      zeitslot: uhrs.find(u => u._id === surveillance.uhr)
    });
    setShowSurveillanceModal(true);
  };

  // Fonctions pour l'édition des commentaires
  const handleEditComment = (cours) => {
    setSelectedCours(cours);
    setEditingComment(cours.commentaire || '');
    setCommentError('');
    setShowEditCommentModal(true);
  };

  const handleCloseEditCommentModal = () => {
    setShowEditCommentModal(false);
    setEditingComment('');
    setCommentError('');
    setSelectedCours(null);
  };

  const handleSubmitEditComment = () => {
    if (!selectedCours) return;

    // Mettre à jour le cours avec le nouveau commentaire
    const updatedCours = {
      ...selectedCours,
      commentaire: editingComment
    };

    if (socket.current?.connected) {
      socket.current.emit('updateCours', updatedCours);
      
      // Fermer le modal immédiatement après l'envoi
      enqueueSnackbar(t('planning.commentUpdated', 'Commentaire mis à jour avec succès'), { variant: 'success' });
      handleCloseEditCommentModal();
    } else {
      setCommentError(t('planning.connectionError', 'Erreur de connexion au serveur'));
    }
  };

  const configureSocketListeners = () => {

    socket.current.on('planningUpdate', (data) => {
      if (data.planning) setCours(data.planning);
      if (data.surveillances) setSurveillances(data.surveillances);
      if (data.zeitslots) setUhrs(data.zeitslots);
    });

    socket.current.on('uhrsUpdate', (data) => {
      console.log('📥 Mise à jour des tranches horaires reçue dans Planning:', data);
      setUhrs(data);
    });

    socket.current.on('enseignantsUpdate', (data) => {
      setEnseignants(data);
    });

    socket.current.on('matieresUpdate', (data) => {
      setMatieres(data);
    });

    socket.current.on('sallesUpdate', (data) => {
      setSalles(data);
    });

    socket.current.on('surveillancesUpdate', (data) => {
      setSurveillances(data);
    });

    socket.current.on('coursUpdate', (data) => {
      setCours(data);
    });

    socket.current.on('classesUpdate', (data) => {
      setClasses(data);
    });

    socket.current.on('annotationsUpdate', (data) => {
      setAnnotations(data);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'primary.main',
          fontWeight: 'bold',
          mb: 3
        }}
      >
        {t('planning.title')}
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        mb: 3
      }}>
        <PlanningFilters
          selectedClasse={selectedClasse}
          setSelectedClasse={setSelectedClasse}
          selectedEnseignant={selectedEnseignant}
          setSelectedEnseignant={setSelectedEnseignant}
          classes={classes}
          enseignants={enseignants}
        />

        <Box sx={{ ml: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title={t('planning.copyWeek', 'Copier cette semaine')}>
            <Button
              startIcon={<ContentCopyIcon />}
              variant="outlined"
              onClick={handleCopyWeek}
              size="small"
              sx={{ 
                minWidth: '100px',
                height: '36px',
                whiteSpace: 'nowrap'
              }}
            >
              {t('planning.copy', 'Copier')}
            </Button>
          </Tooltip>
          
          <Tooltip title={copiedWeekCourses ? t('planning.pasteWeek', 'Coller la semaine copiée ici') : t('planning.noCopyAvailable', 'Aucune semaine copiée')}>
            <span>
              <Button
                startIcon={<ContentPasteIcon />}
                variant="outlined"
                onClick={handlePasteWeekConfirm}
                disabled={!copiedWeekCourses}
                size="small"
                color="secondary"
                sx={{ 
                  minWidth: '100px',
                  height: '36px',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('planning.paste', 'Coller')}
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={t('planning.saveAsModel', 'Enregistrer comme modèle')}>
            <Button
              startIcon={<StarIcon />}
              variant="outlined"
              onClick={handleSaveAsModel}
              size="small"
              color="warning"
              sx={{ 
                minWidth: '100px',
                height: '36px',
                whiteSpace: 'nowrap'
              }}
            >
              {t('planning.saveModel', 'Modèle')}
            </Button>
          </Tooltip>
          
          <Tooltip title={t('planning.applyModel', 'Appliquer un modèle')}>
            <Button
              startIcon={<StarBorderIcon />}
              variant="outlined"
              onClick={handleOpenModelSelection}
              size="small"
              color="warning"
              sx={{ 
                minWidth: '100px',
                height: '36px',
                whiteSpace: 'nowrap'
              }}
            >
              {t('planning.applyModel', 'Appliquer')}
            </Button>
          </Tooltip>
        </Box>

        <WeekSelector
          currentWeek={currentWeek}
          navigateWeek={navigateWeek}
          getWeekNumber={getWeekNumber}
        />
      </Box>

      <DragDropContext
        onDragEnd={handleDragEnd}
      >
        <TableContainer 
          component={Paper} 
          sx={{ 
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            overflow: 'visible'
          }}
        >
          <Table stickyHeader aria-label="planning table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '100px' }}>{t('planning.time')}</TableCell>
                {jours.map((jour, index) => {
                  const weekDates = getWeekDates();
                  return (
                    <TableCell 
                      key={jour} 
                      align="center"
                      sx={{
                        backgroundColor: '#1976d2 !important',
                        color: 'white !important',
                        fontWeight: 'bold !important',
                        padding: '12px !important',
                        textAlign: 'center !important',
                        borderRadius: '8px 8px 0 0 !important',
                        width: '150px', // Largeur fixe pour les colonnes de jour
                        minWidth: '150px',
                        maxWidth: '150px',
                        ...(isCurrentDay(index) ? {
                          backgroundColor: '#42a5f5 !important',
                          color: 'white !important',
                          fontWeight: 'bold !important'
                        } : {})
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'white' }}>
                          {jour}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'white', opacity: 0.9, mt: 0.5 }}>
                          {weekDates[index]}
                        </Typography>
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Ligne de surveillance avant la première heure */}
              <TableRow sx={{ 
                '& td': {
                  borderBottom: '3px solid #90caf9',
                  backgroundColor: '#e3f2fd',
                  height: '40px'
                }
              }}>
                <TableCell 
                  sx={{ 
                    width: '90px',
                    position: 'relative',
                    backgroundColor: '#e3f2fd',
                    borderRight: '1px solid #90caf9',
                    padding: '8px'
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#1976d2',
                    fontWeight: 'bold'
                  }}>
                    {t('planning.surveillanceLabel')}
                  </Box>
                </TableCell>
                {jours.map((jour) => {
                  // Afficher uniquement les surveillances de position -1 (avant la première heure)
                  const frenchDay = convertToFrenchDay(jour);
                  const daySurveillances = getFilteredSurveillances().filter(s => {
                    const surveillanceDay = s.jour.split('-')[0];
                    return surveillanceDay === frenchDay && 
                           s.position === -1 &&
                           s.semaine === getWeekNumber(currentWeek) &&
                           s.annee === currentWeek.getFullYear();
                  }).sort((a, b) => a.ordre - b.ordre);

                  return (
                    <TableCell 
                      key={`${jour}-before`}
                      sx={{ 
                        height: '50px', 
                        cursor: 'pointer',
                        verticalAlign: 'middle',
                        padding: '8px',
                        '&:hover': {
                          bgcolor: '#e9ecef'
                        }
                      }}
                      onClick={() => handleCellClick(jour, uhrs[0]?._id, true, -1)}
                    >
                      <Droppable droppableId={`${jour}-before`} direction="vertical">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ height: '100%' }}
                          >
                            {daySurveillances.map((surveillance, surveillanceIndex) => (
                              <Draggable
                                key={surveillance._id}
                                draggableId={surveillance._id}
                                index={surveillanceIndex}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`surveillance-cell ${snapshot.isDragging ? 'dragging' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSurveillanceClick(surveillance, jour);
                                    }}
                                  >
                                    {renderSurveillance(surveillance)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </TableCell>
                  );
                })}
              </TableRow>

              {uhrs.map((uhr, index) => (
                <React.Fragment key={uhr._id}>
                  {/* Ligne de cours */}
                  <TableRow sx={{ 
                    '& td': {
                      borderBottom: '2px solid #e0e0e0',
                      backgroundColor: '#ffffff'
                    }
                  }}>
                    <TableCell 
                      sx={{ 
                        width: '90px',
                        position: 'relative',
                        backgroundColor: '#ffffff',
                        borderRight: '1px solid #e0e0e0',
                        padding: '8px',
                        '&:hover': {
                          backgroundColor: '#f1f3f5'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        border: '1px solid #e9ecef',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#f8f9fa',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }
                      }}>
                        <Typography sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: '#1976d2',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#e3f2fd'
                        }}>
                          {uhr.nummer}.
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '0.8rem',
                          color: '#495057',
                          textAlign: 'center',
                          lineHeight: 1.2
                        }}>
                          {uhr.start}
                          <br />
                          {uhr.ende}
                        </Typography>
                      </Box>
                    </TableCell>
                    {jours.map((jour) => {
                      const coursCell = getCoursForCell(jour, uhr._id);
                      const droppableId = `${jour}-${uhr._id}`;
                      return (
                        <TableCell key={droppableId} sx={{ height: '150px', padding: '6px', bgcolor: 'background.paper' }}>
                          <Box
                            sx={{
                              minWidth: 200,
                              height: 120,
                              position: 'relative',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                right: 0,
                                top: 8,
                                zIndex: 2,
                                width: '32px',
                                height: '32px',
                                backgroundColor: 'transparent',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <IconButton
                                onClick={() => handleCellClick(jour, uhr._id)}
                                size="small"
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': {
                                    color: 'text.primary',
                                    backgroundColor: 'transparent'
                                  }
                                }}
                              >
                                +
                              </IconButton>
                            </Box>
                            <Droppable droppableId={droppableId} direction="vertical">
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: snapshot.isDraggingOver ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: '4px',
                                    paddingLeft: '8px',
                                    paddingRight: '30px',
                                    minHeight: '40px',
                                    maxHeight: '120px',
                                    overflow: 'auto',
                                    alignItems: 'flex-start',
                                    direction: 'rtl'
                                  }}
                                >
                                  {coursCell.map((cours, index) => (
                                    <Draggable
                                      key={cours._id}
                                      draggableId={cours._id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <Tooltip 
                                          title={
                                            <Box>
                                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {cours.classe}
                                              </Typography>
                                              <Typography variant="body2">
                                                {cours.enseignants?.map(enseignant => enseignant.nom).join(', ')}
                                              </Typography>
                                              <Typography variant="body2">
                                                {cours.matiere}
                                              </Typography>
                                              <Typography variant="body2">
                                                {cours.salle}
                                              </Typography>
                                              {cours.commentaire && (
                                                <Box sx={{ direction: 'ltr' }}>
                                                  <Typography variant="body2" sx={{ 
                                                    color: '#fff', 
                                                    fontStyle: 'italic', 
                                                    mt: 1,
                                                    borderTop: '1px solid rgba(255,255,255,0.3)',
                                                    pt: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    width: '100%',
                                                    display: 'block'
                                                  }}>
                                                    💬 {cours.commentaire}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {cours.annule && (
                                                <Typography variant="body2" sx={{ color: '#fb8c00', fontWeight: 'bold' }}>
                                                  Cours annulé
                                                </Typography>
                                              )}
                                              {cours.remplace && cours.remplacementInfo && (
                                                <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                                  {cours.remplacementInfo}
                                                </Typography>
                                              )}
                                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditComment(cours);
                                                  }}
                                                  sx={{ 
                                                    color: '#fff', 
                                                    borderColor: '#fff',
                                                    '&:hover': {
                                                      borderColor: '#fff',
                                                      backgroundColor: 'rgba(255,255,255,0.1)'
                                                    }
                                                  }}
                                                >
                                                  {t('planning.editComment', 'Modifier le commentaire')}
                                                </Button>
                                              </Box>
                                            </Box>
                                          }
                                          arrow
                                        >
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              ...provided.draggableProps.style,
                                              padding: '4px',
                                              backgroundColor: cours.annule ? '#fb8c00' :
                                                             cours.remplace ? '#4caf50' :
                                                             snapshot.isDragging ? '#1976d2' :
                                                             '#1976d2',
                                              color: 'white',
                                              borderRadius: '4px',
                                              cursor: 'grab',
                                              boxShadow: snapshot.isDragging ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                              zIndex: snapshot.isDragging ? 1000 : 'auto',
                                              width: snapshot.isDragging ? '200px' : '200px',
                                              maxWidth: '200px',
                                              height: 'auto',
                                              maxHeight: '120px',
                                              minHeight: '40px',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              justifyContent: 'center',
                                              overflow: 'hidden'
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                  {cours.classe}
                                                </Typography>
                                                <Typography variant="body2">
                                                  {cours.enseignants?.map(enseignant => enseignant.nom).join(', ')}
                                                </Typography>
                                                <Typography variant="body2">
                                                  {cours.matiere}
                                                </Typography>
                                                <Typography variant="body2">
                                                  {cours.salle}
                                                </Typography>
                                                {cours.commentaire && (
                                                  <Box sx={{ direction: 'ltr' }}>
                                                    <Typography variant="body2" sx={{ 
                                                      color: '#fff', 
                                                      fontStyle: 'italic', 
                                                      mt: 1,
                                                      borderTop: '1px solid rgba(255,255,255,0.3)',
                                                      pt: 1,
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                      width: '100%',
                                                      display: 'block'
                                                    }}>
                                                      💬 {cours.commentaire}
                                                    </Typography>
                                                  </Box>
                                                )}
                                              </Box>
                                              <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedCours(cours);
                                                  setShowDeleteModal(true);
                                                }}
                                                sx={{ 
                                                  color: cours.annule || cours.remplace ? 'inherit' : 'white',
                                                  marginLeft: '8px',
                                                  flexShrink: 0
                                                }}
                                              >
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
                                          </div>
                                        </Tooltip>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Ligne de surveillance entre les tranches horaires */}
                  {index < uhrs.length - 1 && (
                    <TableRow sx={{ 
                      '& td': {
                        borderBottom: '3px solid #90caf9',
                        backgroundColor: '#e3f2fd',
                        height: '40px'
                      }
                    }}>
                      <TableCell 
                        sx={{ 
                          width: '90px',
                          position: 'relative',
                          backgroundColor: '#e3f2fd',
                          borderRight: '1px solid #90caf9',
                          padding: '8px'
                        }}
                      >
                        <Box sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#1976d2',
                          fontWeight: 'bold'
                        }}>
                          {t('planning.surveillanceLabel')}
                        </Box>
                      </TableCell>
                      {jours.map((jour) => {
                        // Afficher uniquement les surveillances de position correspondant à l'index de la ligne
                        const frenchDay = convertToFrenchDay(jour);
                        const daySurveillances = getFilteredSurveillances().filter(s => {
                          const surveillanceDay = s.jour.split('-')[0];
                          return surveillanceDay === frenchDay && 
                                 s.position === index &&
                                 s.semaine === getWeekNumber(currentWeek) &&
                                 s.annee === currentWeek.getFullYear();
                        }).sort((a, b) => a.ordre - b.ordre);

                        return (
                          <TableCell 
                            key={`${jour}-${index}`}
                            sx={{ 
                              height: '50px', 
                              cursor: 'pointer',
                              verticalAlign: 'middle',
                              padding: '8px',
                              '&:hover': {
                                bgcolor: '#e9ecef'
                              }
                            }}
                            onClick={() => handleCellClick(jour, uhr._id, true, index)}
                          >
                            <Droppable droppableId={`${jour}-${index}`} direction="vertical">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{ height: '100%' }}
                                >
                                  {daySurveillances.map((surveillance, surveillanceIndex) => (
                                    <Draggable
                                      key={surveillance._id}
                                      draggableId={surveillance._id}
                                      index={surveillanceIndex}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`surveillance-cell ${snapshot.isDragging ? 'dragging' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSurveillanceClick(surveillance, jour);
                                          }}
                                        >
                                          {renderSurveillance(surveillance)}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              
              {uhrs.length > 0 && (
                <TableRow sx={{ 
                  '& td': {
                    borderBottom: '3px solid #90caf9',
                    backgroundColor: '#e3f2fd',
                    height: '40px'
                  }
                }}>
                  <TableCell 
                    sx={{ 
                      width: '90px',
                      position: 'relative',
                      backgroundColor: '#e3f2fd',
                      borderRight: '1px solid #90caf9',
                      padding: '8px'
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }}>
                      {t('planning.surveillanceLabel')}
                    </Box>
                  </TableCell>
                  {jours.map((jour) => {
                    // Afficher uniquement les surveillances de position uhrs.length (après la dernière heure)
                    const frenchDay = convertToFrenchDay(jour);
                    const surveillances = getFilteredSurveillances().filter(s => {
                      const surveillanceDay = s.jour.split('-')[0];
                      return surveillanceDay === frenchDay && 
                             s.position === uhrs.length &&
                             s.semaine === getWeekNumber(currentWeek) &&
                             s.annee === currentWeek.getFullYear();
                    }).sort((a, b) => a.ordre - b.ordre);
                    
                    return (
                      <TableCell 
                        key={`${jour}-after`}
                        sx={{ 
                          height: '50px', 
                          cursor: 'pointer',
                          verticalAlign: 'middle',
                          padding: '8px',
                          '&:hover': {
                            bgcolor: '#e9ecef'
                          }
                        }}
                        onClick={() => handleCellClick(jour, uhrs[uhrs.length - 1]._id, true, uhrs.length)}
                      >
                        <Droppable droppableId={`${jour}-after`} direction="vertical">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{ height: '100%' }}
                            >
                              {surveillances.map((surveillance, surveillanceIndex) => (
                                <Draggable
                                  key={surveillance._id}
                                  draggableId={surveillance._id}
                                  index={surveillanceIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`surveillance-cell ${snapshot.isDragging ? 'dragging' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSurveillanceClick(surveillance, jour);
                                      }}
                                    >
                                      {renderSurveillance(surveillance)}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </TableCell>
                    );
                  })}
                </TableRow>
              )}
              
              {uhrs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Aucune heure n'est disponible
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Ligne des annotations */}
              <TableRow sx={{ 
                bgcolor: 'background.paper',
                '&:last-child td': {
                  borderBottom: 'none'
                }
              }}>
                <TableCell sx={{ 
                  py: 2, 
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  borderRight: '1px solid #e0e0e0',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: '500' }}>
                    {t('planning.annotations', 'Annotations')}
                  </Typography>
                </TableCell>
                {jours.map((jour, index) => {
                  // Convertir le jour une seule fois pour éviter les appels multiples
                  const frenchDay = jour ? convertToFrenchDay(jour) : null;
                  const hasAnnotation = frenchDay && annotations[frenchDay];
                  
                  return (
                    <TableCell 
                      key={index} 
                      align="center" 
                      sx={{ 
                        minWidth: '200px', 
                        maxWidth: '300px',
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 1,
                        height: '100%'
                      }}>
                        <AnnotationEditor
                          jour={jour}
                          annotation={hasAnnotation}
                          currentWeek={currentWeek}
                          socket={socket.current}
                        />
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DragDropContext>

      {/* Modal pour modifier l'heure */}
      <Dialog open={isTimeModalOpen} onClose={() => setIsTimeModalOpen(false)}>
        <DialogTitle>{t('planning.editTimeSlot')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('planning.newTimeSlot')}
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            placeholder="Ex: 7:40 - 8:25"
            margin="normal"
            helperText={t('planning.timeFormat')}
            error={!!error}
            FormHelperTextProps={{ error: !!error }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsTimeModalOpen(false);
            setError('');
          }}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTimeChange}
            disabled={!customTime}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour ajouter une nouvelle tranche horaire */}
      <Dialog open={isAddTimeModalOpen} onClose={() => setIsAddTimeModalOpen(false)}>
        <DialogTitle>Ajouter une nouvelle tranche horaire</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Numéro de la tranche"
            type="number"
            value={newTimeSlot.nummer}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, nummer: e.target.value })}
            placeholder="Ex: 9"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nouvelle tranche horaire"
            value={newTimeSlot.zeitslot}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, zeitslot: e.target.value })}
            placeholder="Ex: 7:40 - 8:25"
            margin="normal"
            helperText="Format: HH:MM - HH:MM"
            error={!!error}
            FormHelperTextProps={{ error: !!error }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsAddTimeModalOpen(false);
            setError('');
          }}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddTimeSlot}
            disabled={!newTimeSlot.nummer || !newTimeSlot.zeitslot}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour ajouter un nouveau cours */}
      <AddCourseModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        classes={classes}
        enseignants={enseignants}
        matieres={matieres}
        salles={salles}
        uhrs={uhrs}
        selectedCell={selectedCell}
        cours={cours}
        currentWeek={getWeekNumber(currentWeek)}
      />

      {/* Dialogue pour enregistrer un modèle de semaine */}
      <Dialog
        open={showSaveModelDialog}
        onClose={() => setShowSaveModelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('planning.saveAsModel', 'Enregistrer cette semaine comme modèle')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('planning.modelName', 'Nom du modèle')}
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            helperText={t('planning.modelNameHelp', 'Donnez un nom descriptif à ce modèle de semaine')}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('planning.modelSaveInfo', 'Ce modèle contiendra les cours et surveillances de la semaine {{week}} de l\'année {{year}}', {
              week: getWeekNumber(currentWeek),
              year: currentWeek.getFullYear()
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveModelDialog(false)}>
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button 
            onClick={handleSaveModelConfirm}
            variant="contained" 
            color="primary"
          >
            {t('common.save', 'Enregistrer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue pour sélectionner un modèle à appliquer */}
      <Dialog
        open={showModelSelectionDialog}
        onClose={() => setShowModelSelectionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('planning.selectModel', 'Sélectionner un modèle de semaine')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('planning.applyModelInfo', 'Sélectionnez un modèle à appliquer à la semaine {{week}} de l\'année {{year}}', {
              week: getWeekNumber(currentWeek),
              year: currentWeek.getFullYear()
            })}
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('planning.modelName', 'Nom du modèle')}</TableCell>
                  <TableCell>{t('planning.sourceWeek', 'Semaine source')}</TableCell>
                  <TableCell>{t('planning.courseCount', 'Nombre de cours')}</TableCell>
                  <TableCell>{t('planning.surveillanceCount', 'Nombre de surveillances')}</TableCell>
                  <TableCell>{t('planning.createdAt', 'Créé le')}</TableCell>
                  <TableCell align="center">{t('common.actions', 'Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modelWeeks.map((model) => (
                  <TableRow 
                    key={model.id}
                    hover
                    selected={selectedModelWeek?.id === model.id}
                    onClick={() => setSelectedModelWeek(model)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{model.name}</TableCell>
                    <TableCell>
                      {t('planning.week')} {model.sourceWeek} - {model.sourceYear}
                    </TableCell>
                    <TableCell>{model.courses.length}</TableCell>
                    <TableCell>{model.surveillances ? model.surveillances.length : 0}</TableCell>
                    <TableCell>
                      {new Date(model.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModel(model.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {modelWeeks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {t('planning.noModelSaved', 'Aucun modèle de semaine n\'est enregistré')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {selectedModelWeek && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('planning.selectedModel', 'Modèle sélectionné')}: {selectedModelWeek.name}
              </Typography>
              <Typography variant="body2">
                {t('planning.modelContains', 'Ce modèle contient {{courseCount}} cours et {{surveillanceCount}} surveillances de la semaine {{week}} - {{year}}', {
                  courseCount: selectedModelWeek.courses.length,
                  surveillanceCount: selectedModelWeek.surveillances ? selectedModelWeek.surveillances.length : 0,
                  week: selectedModelWeek.sourceWeek,
                  year: selectedModelWeek.sourceYear
                })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModelSelectionDialog(false)}>
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button 
            onClick={handleApplyModel}
            variant="contained" 
            color="primary"
            disabled={!selectedModelWeek}
          >
            {t('planning.applySelectedModel', 'Appliquer le modèle')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation pour coller une semaine */}
      <Dialog
        open={showPasteConfirmation}
        onClose={() => setShowPasteConfirmation(false)}
      >
        <DialogTitle>{t('planning.confirmPasteWeek', 'Confirmer le collage de la semaine')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {t('planning.confirmPasteWeekText', 'Voulez-vous coller la semaine {{sourceWeek}} de {{sourceYear}} vers la semaine {{targetWeek}} de {{targetYear}} ?', {
              sourceWeek: copiedWeekData?.sourceWeek,
              sourceYear: copiedWeekData?.sourceYear,
              targetWeek: getWeekNumber(currentWeek),
              targetYear: currentWeek.getFullYear()
            })}
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            {t('planning.pasteWarning', 'Cette action n\'écrasera pas les cours existants dans la semaine cible. Les cours seront ajoutés en plus des cours existants.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasteConfirmation(false)}>
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button 
            onClick={handlePasteWeek}
            variant="contained" 
            color="primary"
          >
            {t('common.confirm', 'Confirmer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de surveillance */}
      <AddSurveillanceModal
        open={showSurveillanceModal}
        onClose={() => {
          setShowSurveillanceModal(false);
          setSelectedCell(null);
          setNewSurveillance({
            enseignant: '',
            lieu: '',
            jour: '',
            position: -1,
            zeitslot: null
          });
        }}
        enseignants={enseignants}
        currentWeek={currentWeek}
        socket={socket.current}
        selectedJour={selectedCell?.jour}
        selectedZeitslot={selectedCell?.zeitslot}
        selectedPosition={selectedCell?.position}
        existingSurveillance={selectedCell?.surveillance}
      />

      {/* Modal de suppression de cours */}
      <DeleteCourseModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => handleDeleteConfirm('delete')}
        onCancel={() => handleDeleteConfirm('cancel')}
        onReplace={() => handleDeleteConfirm('replace')}
        selectedCours={selectedCours}
      />

      {/* Modal de remplacement */}
      <Dialog
        open={showReplaceModal}
        onClose={handleReplaceCancel}
        PaperProps={{
          sx: {
            minWidth: '400px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          fontSize: '1.25rem',
          fontWeight: '500'
        }}>
          {t('planning.replaceCourse')}
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('planning.teachers')}</InputLabel>
            <Select
              multiple
              value={replacementData.enseignants}
              onChange={(e) => setReplacementData({ ...replacementData, enseignants: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={typeof value === 'string' ? value : value.nom || ''} 
                    />
                  ))}
                </Box>
              )}
            >
              {enseignants.map((enseignant) => (
                <MenuItem key={enseignant._id} value={enseignant.nom}>
                  {enseignant.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('planning.subject')}</InputLabel>
            <Select
              value={replacementData.matiere}
              onChange={(e) => setReplacementData({ ...replacementData, matiere: e.target.value })}
            >
              {matieres.map((matiere) => (
                <MenuItem key={matiere._id} value={matiere.nom}>
                  {matiere.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('planning.room')}</InputLabel>
            <Select
              value={replacementData.salle}
              onChange={(e) => setReplacementData({ ...replacementData, salle: e.target.value })}
            >
              {salles.map((salle) => (
                <MenuItem key={salle._id} value={salle.nom}>
                  {salle.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5'
        }}>
          <Button 
            onClick={handleReplaceCancel}
            sx={{
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleReplaceSubmit} 
            variant="contained" 
            color="success"
            sx={{
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de surveillance */}
      <AddSurveillanceModal
        open={openSurveillanceModal}
        onClose={() => setOpenSurveillanceModal(false)}
        enseignants={enseignants}
        currentWeek={currentWeek}
        socket={socket.current}
        selectedJour={selectedCell?.jour}
        selectedZeitslot={selectedCell?.zeitslot}
        selectedPosition={selectedCell?.position}
      />

      {/* Modal pour éditer les commentaires */}
      <EditCommentModal
        open={showEditCommentModal}
        onClose={handleCloseEditCommentModal}
        onSubmit={handleSubmitEditComment}
        comment={editingComment}
        setComment={setEditingComment}
        error={commentError}
        selectedCours={selectedCours}
      />
    </Box>
  );
}

export default Planning; 