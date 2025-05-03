// js/storage.js
;(function() {
  const STORAGE_KEY = 'ft_current';

  // 1️⃣ Load profile from localStorage
  function loadProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      console.error('Failed to parse profile in localStorage', e);
      return {};
    }
  }

  // 2️⃣ Save profile to localStorage (and Firebase if you have db initialized)
  function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    if (window.db) {
      db.ref('ft_profile').set(profile).catch(console.error);
    }
  }

  // 3️⃣ Update avatars & name everywhere
  function updateProfileUI() {
    const profile   = loadProfile();
    const avatarUrl = profile.avatarDataUrl;
    const fullName  = profile.name;

    // Sidebar icon(s)
    document.querySelectorAll('#sideAvatar, .sidebar .profile-menu i, .sidebar .profile-menu img')
      .forEach(el => {
        if (!avatarUrl) return;
        if (el.tagName === 'IMG') el.src = avatarUrl;
        else el.outerHTML = `<img id="sideAvatar" src="${avatarUrl}" class="avatar-small" />`;
      });

    // Header icon(s)
    document.querySelectorAll('#hdrAvatarIcon, .avatar-btn i, .avatar-btn img')
      .forEach(el => {
        if (!avatarUrl) return;
        if (el.tagName === 'IMG') el.src = avatarUrl;
        else el.outerHTML = `<img id="hdrAvatarIcon" src="${avatarUrl}" class="avatar-small" />`;
      });

    // Optional: any <span class="user-name">…</span>
    document.querySelectorAll('.user-name').forEach(el => {
      if (fullName) el.textContent = fullName;
    });
  }

  // 4️⃣ Prefill profile form on profile.html
  function prefillProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    const p = loadProfile();
    const map = {
      fullName: p.name,
      email:    p.email,
      bio:      p.bio,
      location: p.location,
      age:      p.age,
      gender:   p.gender,
      height:   p.height,
      weight:   p.weight,
      favorite: p.favorite,
      goals:    p.goals,
      theme:    p.theme
    };
    Object.entries(map).forEach(([id, val]) => {
      const inp = document.getElementById(id);
      if (inp && val != null) inp.value = val;
    });
    document.getElementById('notifEmail').checked = !!p.notifEmail;
    document.getElementById('notifPush').checked  = !!p.notifPush;
  }

  // 5️⃣ Hide “complete profile” nag on dashboard.html
  function checkDashboardNotification() {
    const notif = document.getElementById('completeProfileNotif');
    if (!notif) return;
    const p = loadProfile();
    if (p.name && p.email) notif.style.display = 'none';
  }

  // 6️⃣ Wire up on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    prefillProfileForm();
    checkDashboardNotification();

    // Save button on profile.html
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const profile = loadProfile();
        ['fullName','email','bio','location','age','gender','height','weight','favorite','goals','theme']
          .forEach(id => {
            const el = document.getElementById(id);
            if (el) profile[id === 'fullName' ? 'name' : id] = el.value;
          });
        profile.notifEmail = !!document.getElementById('notifEmail').checked;
        profile.notifPush  = !!document.getElementById('notifPush').checked;
        saveProfile(profile);
        updateProfileUI();
        checkDashboardNotification();
        alert('Profile saved!');
      });
    }

    // Change‑avatar input
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
      avatarInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const p = loadProfile();
          p.avatarDataUrl = reader.result;
          saveProfile(p);
          updateProfileUI();
        };
        reader.readAsDataURL(file);
      });
    }
  });

  // Expose if needed
  window.profileStorage = { loadProfile, saveProfile, updateProfileUI };
})();
