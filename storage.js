// storage.js
(function(global){
  // 1) Helpers
  function load(key, def = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch { return def; }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // 2) Initialize ft_current if missing
  let cur = load('ft_current', {});
  if (!cur.stats) {
    cur.stats = { workouts:0, distanceKm:0, calories:0, daysSet:[] };
    cur.chartData = { labels:[], activity:[], distribution:[] };
    cur.progress  = 0;
    save('ft_current', cur);
  }

  // 3) Apply theme class on <body>
  function applyTheme() {
    document.body.classList.toggle('light-theme', cur.theme === 'light');
  }

  // 4) Recompute stats+chartData+progress from ft_activities
  function updateStats() {
    const acts = load('ft_activities', []);
    // a) summary
    const workouts  = acts.length;
    const distanceKm = acts.reduce((sum,a)=> sum + (parseFloat(a.distance)||0), 0);
    const calories  = acts.reduce((sum,a)=> sum + (parseFloat(a.calories)||0), 0);
    const daysSet   = [...new Set(acts.map(a=>a.date))];

    // b) last 7 days labels & durations
    const last7 = [];
    for(let i=6;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      last7.push(d.toISOString().slice(0,10));
    }
    const labels   = last7.map(d=> d.slice(5));
    const activity = last7.map(d=>
      acts.filter(a=>a.date===d).reduce((s,a)=> s + (parseFloat(a.duration)||0), 0)
    );

    // c) distribution by type
    const byType = acts.reduce((o,a)=>{
      o[a.type] = (o[a.type]||0)+1; return o;
    }, {});
    const distribution = Object.values(byType);

    // d) weekly progress % of 5-workout target
    const weekCount = activity.filter(v=>v>0).length;
    const progress  = Math.min(100, Math.round(weekCount/5*100));

    // e) write back
    Object.assign(cur,{
      stats: { workouts, distanceKm, calories, daysSet },
      chartData: { labels, activity, distribution },
      progress
    });
    save('ft_current', cur);
  }

  // 5) Render greeting (Hello vs Welcome back)
  function renderGreeting(el) {
    const text = cur.isNew
      ? `Hello ${cur.name}`
      : `Welcome back, ${cur.name}`;
    el.textContent = text;
    if (cur.isNew) {
      cur.isNew = false;
      save('ft_current', cur);
    }
  }

  // 6) Initialize Profile form on profile.html
  function initProfileForm(opts) {
    // opts: { avatarPreview, avatarInput, fields: {...}, saveBtn, logoutBtn }
    const f = opts.fields;
    // fill form values
    f.fullName.value = cur.name      || '';
    f.email.value    = cur.email     || '';
    f.bio.value      = cur.bio       || '';
    f.location.value = cur.location  || '';
    f.age.value      = cur.age       || '';
    f.gender.value   = cur.gender    || '';
    f.height.value   = cur.height    || '';
    f.weight.value   = cur.weight    || '';
    f.favorite.value = cur.favorite  || '';
    f.goals.value    = cur.goals     || '';
    f.theme.value    = cur.theme     || 'dark';
    opts.fields.notifEmail.checked = !!cur.notifEmail;
    opts.fields.notifPush.checked  = !!cur.notifPush;
    opts.avatarPreview.src = cur.avatarDataUrl
      || `https://i.pravatar.cc/150?u=${cur.email||'default'}`;
    applyTheme();

    // avatar change
    opts.avatarInput.addEventListener('change', e=>{
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        opts.avatarPreview.src = reader.result;
        cur.avatarDataUrl      = reader.result;
      };
      reader.readAsDataURL(file);
    });

    // save button
    opts.saveBtn.addEventListener('click', ()=>{
      const name = f.fullName.value.trim();
      if (!name) return alert('Full Name is required.');
      // gather
      cur.name       = name;
      cur.bio        = f.bio.value.trim();
      cur.location   = f.location.value.trim();
      cur.age        = f.age.value;
      cur.gender     = f.gender.value;
      cur.height     = f.height.value;
      cur.weight     = f.weight.value;
      cur.favorite   = f.favorite.value;
      cur.goals      = f.goals.value.trim();
      cur.theme      = f.theme.value;
      cur.notifEmail = f.notifEmail.checked;
      cur.notifPush  = f.notifPush.checked;
      save('ft_current', cur);
      applyTheme();
      alert('✅ Profile saved!');
    });

    // logout
    opts.logoutBtn.addEventListener('click', ()=> location.href='home.html');
  }

  // expose
  global.FT = {
    load, save, cur,
    applyTheme,
    updateStats,
    renderGreeting,
    initProfileForm
  };
})(window);
