// firebase-init.js
// 1) Load Firebase compat in your HTML, then this:

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDO-IrBAGaZ8-LFbW_6wbkSBOh_2DPGRaw",
  authDomain: "workout-4cb4d.firebaseapp.com",
  databaseURL: "https://workout-4cb4d-default-rtdb.firebaseio.com",
  projectId: "workout-4cb4d",
  storageBucket: "workout-4cb4d.appspot.com",
  messagingSenderId: "114995917937",
  appId: "1:114995917937:web:d6416c087915ebd50f57d0"
});
const db = firebase.database();

// Seed pseudo-users if none exist
db.ref('ft_leaderboard').once('value').then(snap => {
  if (!snap.exists()) {
    db.ref('ft_leaderboard').set({
      Alice: { name:'Alice', workouts:25, distanceKm:120, avatar:'alice.jpg' },
      Bob:   { name:'Bob',   workouts:20, distanceKm:95,  avatar:'bob.jpg'   },
      Cara:  { name:'Cara',  workouts:18, distanceKm:80,  avatar:'cara.jpg'  },
      Dana:  { name:'Dana',  workouts:15, distanceKm:70,  avatar:'https://i.pravatar.cc/150?u=dana' },
      Evan:  { name:'Evan',  workouts:12, distanceKm:55,  avatar:'https://i.pravatar.cc/150?u=evan' }
    });
  }
});
