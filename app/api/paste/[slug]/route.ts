<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Latino IPTV Pro — Panel Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap" rel="stylesheet">
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f1117;--surface:#161b27;--surface-2:#1e2535;--surface-3:#252d3d;
  --border:#2a3347;--text:#e2e8f0;--text-muted:#8892a4;--text-faint:#4a5568;
  --primary:#3b82f6;--primary-hover:#2563eb;--danger:#ef4444;--success:#22c55e; --warning:#f59e0b;
  --radius-sm:6px;--radius-md:10px;--radius-lg:14px;--font:'Inter',sans-serif;
}
html,body{height:100%;font-family:var(--font);background:var(--bg);color:var(--text);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}

/* LOGIN */
#login-screen{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.login-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:40px;width:100%;max-width:400px}
.login-logo{display:flex;align-items:center;gap:10px;margin-bottom:28px}
.login-logo-text{font-size:18px;font-weight:700}.login-logo-text span{color:var(--primary)}
.login-title{font-size:22px;font-weight:700;margin-bottom:6px}
.login-sub{color:var(--text-muted);font-size:13px;margin-bottom:28px}

/* FORMULARIOS Y BOTONES */
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.form-input{width:100%;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-size:14px;font-family:var(--font);transition:border-color .15s}
.form-input:focus{outline:none;border-color:var(--primary)}
.form-input::placeholder{color:var(--text-faint)}
select.form-input{cursor:pointer}
.btn-primary{width:100%;background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);padding:11px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s}
.btn-primary:hover:not(:disabled){background:var(--primary-hover)}
.btn-secondary{background:var(--surface-3);color:var(--text);border:1px solid var(--border);border-radius:var(--radius-sm);padding:11px;font-size:14px;font-weight:600;cursor:pointer;}
.btn-add{background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;}
.btn-add:hover{background:var(--primary-hover)}
.btn-refresh{background:var(--surface-3);color:var(--text);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 16px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;}

/* LAYOUT PRINCIPAL */
#app-shell{display:none;height:100vh;overflow:hidden; flex-direction:row;}
.sidebar{width:240px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100vh;overflow-y:auto}
.sidebar-logo{padding:20px 16px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border)}
.sidebar-logo-text{font-size:15px;font-weight:700;line-height:1.2}
.sidebar-logo-text span{color:var(--primary);display:block;font-size:11px;font-weight:400;color:var(--text-muted)}
.nav-section{padding:16px 10px 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-faint)}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);cursor:pointer;color:var(--text-muted);font-size:13px;font-weight:500;margin:2px 8px;transition:all .15s;border:none;background:none;width:calc(100% - 16px);text-align:left}
.nav-item:hover{background:var(--surface-2);color:var(--text)}
.nav-item.active{background:rgba(59,130,246,.15);color:var(--primary)}
.nav-icon{font-size:16px;width:20px;text-align:center}
.sidebar-bottom{margin-top:auto;padding:12px 10px;border-top:1px solid var(--border)}
.user-row{display:flex;align-items:center;gap:8px;padding:8px;border-radius:var(--radius-sm)}
.user-avatar{width:32px;height:32px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
.user-email{font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.btn-logout{background:none;border:none;cursor:pointer;color:var(--text-faint);font-size:16px;padding:4px;border-radius:4px;}
.btn-logout:hover{color:var(--danger)}
.main-content{flex:1;overflow-y:auto;padding:28px 32px}
.section{display:none}

/* HEADER & GRIDS */
.page-header{margin-bottom:24px}
.page-title{font-size:22px;font-weight:700}
.page-sub{font-size:13px;color:var(--text-muted);margin-top:4px}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:28px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:20px}
.stat-label{font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px}
.stat-value{font-size:32px;font-weight:700;line-height:1}
.section-header{display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px}
.section-title{font-size:14px;font-weight:700; color:var(--text-muted); text-transform:uppercase;}

/* TARJETAS LISTA */
.list-container{display:flex;flex-direction:column;gap:10px; margin-bottom: 30px;}
.list-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.list-card.expired { border-color: var(--danger); background: rgba(239, 68, 68, 0.05); }
.list-card.inactive{opacity:.55}
.list-card-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
.list-thumb{width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;background:var(--surface-2)}
.list-thumb-placeholder{width:48px;height:48px;border-radius:8px;background:var(--surface-3);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.list-info{min-width:0; flex:1;}
.list-name{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.list-url{font-size:11px;color:var(--text-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:400px;margin-top:2px}
.owner-name { font-size: 14px; font-weight: 700; color: #fff; }
.key-text { font-family: monospace; font-size: 16px; font-weight: bold; color: var(--primary); letter-spacing: 1px; }
.server-badge { background: var(--surface-3); border: 1px solid var(--border); font-size: 10px; padding: 2px 6px; border-radius: 4px; color: var(--text-muted); margin-left: 8px;}
.list-meta{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap; align-items: center;}
.badge{font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:20px}
.badge-on{background:rgba(34,197,94,.15);color:#4ade80}
.badge-off{background:rgba(239,68,68,.12);color:#f87171}
.badge-warning{background:rgba(245,158,11,.12);color:#fbbf24}
.list-actions{display:flex;gap:6px;flex-shrink:0}
.btn-icon{background:var(--surface-2);border:1px solid var(--border);border-radius:6px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;}
.btn-icon.btn-danger:hover{background:rgba(239,68,68,.15);border-color:var(--danger)}
.btn-reactivate { background: var(--primary); color:#fff; border:none; border-radius:6px; padding: 0 12px; height:34px; font-size:12px; font-weight:600; cursor:pointer; }

/* MODALES */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1100;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);width:100%;max-width:560px;max-height:90vh;overflow-y:auto}
.modal-header{padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.modal-title{font-size:16px;font-weight:700}
.modal-close{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:20px;}
.modal-body{padding:20px 24px}
.modal-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end}
#toast{position:fixed;bottom:24px;right:24px;background:#1e293b;border:1px solid var(--border);color:var(--text);padding:12px 20px;border-radius:var(--radius-md);z-index:2000;transform:translateY(80px);opacity:0;transition:all .25s;}
#toast.show{transform:translateY(0);opacity:1}

/* OTROS */
.live-timer { font-family: monospace; font-size: 12px; color: var(--success); background: rgba(34,197,94,0.1); padding: 2px 6px; border-radius:4px; }
.uuid-text { font-size: 10px; color: var(--text-faint); margin-top: 4px; display: block; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
.toggle-label { font-size: 14px; font-weight: 500; }
.xui-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px;}
.xui-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; position: relative;}
.xui-card-title { font-size: 16px; font-weight: bold; margin-bottom: 4px; display: flex; justify-content: space-between;}
.xui-card-host { font-size: 11px; color: var(--primary); font-family: monospace; margin-bottom: 16px;}
.xui-stat-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; border-bottom: 1px dashed var(--border); padding-bottom: 4px;}
.xui-stat-val { font-weight: bold; color: #fff;}
.xui-actions { margin-top: 16px; display: flex; gap: 8px; }
.xui-loading { color: var(--warning); font-size: 12px; font-style: italic;}
.server-stats-box { margin-top: 8px; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; color: var(--text-muted); }
.tmdb-item:hover{background:var(--surface-3) !important; border-color: var(--primary) !important;}
.queue-item-input { background: var(--surface-3); color: white; border: 1px solid var(--border); border-radius: 4px; padding: 4px; font-size: 11px; outline: none; }
.bulk-badge { background: var(--primary); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight:bold; cursor: pointer; border: none; margin-right: 5px; }
.bulk-badge:hover:not(:disabled) { background: var(--primary-hover); }
.bulk-badge:disabled { opacity: 0.5; cursor: not-allowed; }
.responsive-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }

/* DISEÑO RESPONSIVO (MÓVILES) */
.mobile-topbar { display: none; align-items: center; justify-content: space-between; padding: 15px 20px; background: var(--surface); border-bottom: 1px solid var(--border); }
.hamburger { background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px; }

@media (max-width: 850px) {
    .mobile-topbar { display: flex; }
    #app-shell { flex-direction: column; }
    
    .sidebar { 
        position: fixed; top: 0; left: -260px; height: 100vh; width: 260px; 
        z-index: 1000; box-shadow: 2px 0 15px rgba(0,0,0,0.7); transition: left 0.3s ease; 
    }
    .sidebar.open { left: 0; }
    
    .main-content { padding: 15px; }
    .responsive-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .form-row { flex-direction: column; gap: 0; }
    .page-title { font-size: 20px; }
    
    .page-header > div { flex-direction: column; align-items: flex-start !important; gap: 10px; }
    .page-header > div > div:nth-child(2) { width: 100%; display: flex; flex-wrap: wrap; }
    .stat-card > div > select, .stat-card > div > input { margin-bottom: 10px; }
    
    .list-card { flex-direction: column; align-items: flex-start; }
    .list-actions { width: 100%; justify-content: flex-end; margin-top: 10px; }
}
</style>
</head>
<body>

<div id="login-screen">
  <div class="login-card">
    <div class="login-logo">
      <div style="width:38px;height:38px;background:var(--primary);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">📺</div>
      <div class="login-logo-text">Latino IPTV Pro <span>Admin</span></div>
    </div>
    <div class="login-title">Bienvenido 👋</div>
    <div class="form-group"><label class="form-label">Correo electrónico</label><input id="login-email" class="form-input" type="email"></div>
    <div class="form-group"><label class="form-label">Contraseña</label><input id="login-pass" class="form-input" type="password"></div>
    <button class="btn-primary" onclick="doLogin()">Entrar</button>
  </div>
</div>

<div id="sidebar-overlay" onclick="toggleSidebar(false)" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:999;"></div>

<div id="app-shell">
  <div class="mobile-topbar">
      <div style="display:flex; align-items:center; gap:10px;">
          <button class="hamburger" onclick="toggleSidebar(true)">☰</button>
          <div style="font-weight:bold; font-size:16px;">Latino IPTV Pro</div>
      </div>
  </div>

  <nav class="sidebar">
    <div class="sidebar-logo">
      <div style="width:28px;height:28px;background:var(--primary);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">📺</div>
      <div class="sidebar-logo-text">Latino IPTV Pro<span>Admin Panel</span></div>
    </div>
    
    <div class="nav-section">Principal</div>
    <button class="nav-item active" data-section="dashboard" onclick="navTo('dashboard')"><span class="nav-icon">📊</span> Dashboard</button>
    
    <div class="nav-section">Accesos</div>
    <button class="nav-item" data-section="keys" onclick="navTo('keys')"><span class="nav-icon">🔑</span> Licencias</button>
    
    <div class="nav-section">Contenido</div>
    <button class="nav-item" data-section="m3u" onclick="navTo('m3u')"><span class="nav-icon">📋</span> Listas M3U App</button>
    <button class="nav-item" data-section="m3u-creator" onclick="navTo('m3u-creator')"><span class="nav-icon">📝</span> Creador M3U</button>
    <button class="nav-item" data-section="editor-raw" onclick="navTo('editor-raw')"><span class="nav-icon">🛠️</span> Editar RAW</button>
    <button class="nav-item" data-section="xui" onclick="navTo('xui')"><span class="nav-icon">⚙️</span> Servidores XUI</button>
    
    <div class="nav-section">Sistema</div>
    <button class="nav-item" data-section="info" onclick="navTo('info')"><span class="nav-icon">ℹ️</span> Ajustes</button>
    
    <div class="sidebar-bottom">
      <div class="user-row">
        <div class="user-avatar">A</div>
        <span class="user-email" id="user-email">admin</span>
        <button class="btn-logout" onclick="doLogout()">⏻</button>
      </div>
    </div>
  </nav>

  <main class="main-content">
    <div id="sec-dashboard" class="section" style="display:block;">
      <div class="page-header"><div class="page-title">Dashboard</div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Pines Totales</div><div class="stat-value" id="stat-keys-total">0</div></div>
        <div class="stat-card"><div class="stat-label">Pines en Uso</div><div class="stat-value" id="stat-keys-used">0</div></div>
        <div class="stat-card"><div class="stat-label">Listas en App</div><div class="stat-value" id="stat-m3u-dash">0</div></div>
        <div class="stat-card"><div class="stat-label">Servidores XUI</div><div class="stat-value" id="stat-xui-total">0</div></div>
      </div>
    </div>

    <div id="sec-keys" class="section">
      <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><div class="page-title">Licencias (Pines)</div></div>
          <div style="display:flex; gap:10px;">
            <button class="btn-refresh" onclick="loadKeys()">🔄 Actualizar</button>
            <button class="btn-add" onclick="openKeyModal()">＋ Generar Key</button>
          </div>
        </div>
      </div>
      <div id="keys-expired-container" class="list-container"></div>
      <div id="keys-active-container" class="list-container"></div>
      <div id="keys-unused-container" class="list-container"></div>
    </div>

    <div id="sec-m3u" class="section">
      <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div><div class="page-title">Listas en la App</div><div class="page-sub">Gestiona las listas que los usuarios ven en Android</div></div>
            <button class="btn-add" onclick="openAddM3u()">＋ Agregar manual</button>
        </div>
      </div>
      <div id="m3u-list-container" class="list-container"></div>
    </div>

    <div id="sec-m3u-creator" class="section">
      <div class="page-header">
        <div class="page-title">Creador de Listas M3U</div>
        <div class="page-sub">Busca en TMDB y sube o actualiza tus RAW en Pastebin</div>
      </div>
      
      <div class="stat-card" style="padding:0; border:none; background:transparent;">
          <div class="responsive-grid">
              <div style="background: var(--surface-2); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                  
                  <div style="display:flex; gap:10px; margin-bottom:15px;">
                      <button id="btn-tab-tmdb" class="btn-primary" onclick="switchCreatorTab('tmdb')" style="flex:1;">1. Buscar TMDB</button>
                      <button id="btn-tab-import" class="btn-secondary" onclick="switchCreatorTab('import')" style="flex:1;">2. Importar M3U</button>
                  </div>

                  <div id="tab-tmdb">
                      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                          <input type="text" id="tmdb-search-input" placeholder="Ej: Arrow, Mario Bros..." style="flex: 1; padding: 12px; background: var(--surface-3); border: 1px solid var(--border); color: white; border-radius: 8px;">
                          <button onclick="searchTMDB()" style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Buscar</button>
                      </div>
                      <div id="tmdb-results" style="max-height: 350px; overflow-y: auto; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px;"></div>
                      
                      <div id="m3u-creator-form" style="display: none; border-top: 1px solid var(--border); padding-top:20px;">
                          <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                              <img id="preview-poster" src="" style="width: 100px; border-radius: 8px; border: 1px solid var(--border);">
                              <div><h3 id="preview-title" style="color: white; margin-bottom: 5px;"></h3><p id="preview-year" style="color: var(--text-muted); font-size: 13px;"></p></div>
                          </div>
                          
                          <label class="form-label">URL DEL VIDEO / EPISODIO</label>
                          <input type="text" id="video-url-input" placeholder="https://..." class="form-input" style="margin-bottom:15px;">
                          
                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                              <div><label class="form-label">CALIDAD</label><select id="quality-select" class="form-input"><option value="SD">SD</option><option value="HD" selected>HD</option><option value="FHD">Full HD</option><option value="4K">4K</option><option value="CAM">CAM</option></select></div>
                              <div><label class="form-label">IDIOMA</label><select id="lang-select" class="form-input"><option value="Latino">Latino</option><option value="Castellano">Castellano</option><option value="Sub">Subtitulado</option><option value="Ingles">Inglés</option></select></div>
                          </div>

                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                              <div>
                                  <label class="form-label">CATEGORÍA APP / SERIE</label>
                                  <div style="display:flex; gap:5px;">
                                      <select id="group-select" class="form-input" style="flex:1;"></select>
                                      <button onclick="addNewCategory()" class="btn-secondary" style="padding:0 10px;">➕</button>
                                  </div>
                              </div>
                              <div style="display: flex; align-items: center; gap: 10px; padding-top: 20px;">
                                  <input type="checkbox" id="is-embed-check" style="width: 20px; height: 20px; cursor: pointer;">
                                  <label for="is-embed-check" style="color: white; font-size: 14px; cursor: pointer;">¿Es Embed?</label>
                              </div>
                          </div>
                          <button onclick="addToQueue()" class="btn-primary" style="background:var(--success); font-size:16px;">+ AGREGAR A COLA</button>
                      </div>
                  </div>

                  <div id="tab-import" style="display:none;">
                      <label class="form-label">PEGA TU BLOQUE M3U AQUÍ</label>
                      <textarea id="import-textarea" style="width:100%; height:400px; background:var(--surface-3); color:white; border:1px solid var(--border); border-radius:8px; padding:10px; font-family:monospace; font-size:11px;" placeholder="#EXTINF:-1 tvg-logo='...' group-title='...',Título\nhttp://url..."></textarea>
                      <button onclick="processImportM3U()" class="btn-primary" style="margin-top:15px;">📥 DESGLOSAR E IMPORTAR A COLA</button>
                  </div>
              </div>

              <div style="background: var(--surface-2); padding: 20px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <label style="color: var(--text-muted); font-size: 12px; font-weight: bold;">COLA DE PRODUCCIÓN</label>
                      <button onclick="clearQueue()" class="btn-icon btn-danger" style="width:auto; padding:0 10px; font-size:10px;">Vaciar</button>
                  </div>
                  
                  <div style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 5px;">
                      <button onclick="bulkSetQuality('HD')" class="bulk-badge">Todo HD</button>
                      <button onclick="bulkSetQuality('4K')" class="bulk-badge">Todo 4K</button>
                      <button onclick="bulkSetLang('Latino')" class="bulk-badge">Todo Latino</button>
                      <button onclick="bulkSetEmbed(true)" class="bulk-badge" style="background:#10b981">Todo Embed</button>
                      
                      <button id="btn-filter-logo" onclick="toggleNoLogoFilter()" class="bulk-badge" style="background:#eab308; color:black; font-weight:800;">Ver Sin Logo ⚠️</button>
                      <button id="btn-autofill-logos" onclick="autoFillMissingLogos()" class="bulk-badge" style="background:#8b5cf6;">🤖 Auto-Completar Logos</button>
                  </div>

                  <div id="m3u-queue-container" style="flex: 1; overflow-y: auto; background: var(--bg); border-radius: 8px; padding: 10px; border: 1px solid var(--border); margin-bottom: 20px; min-height: 300px; max-height: 500px;">
                      <p id="empty-queue-msg" style="color: var(--text-faint); text-align: center; margin-top: 120px;">Cola vacía...</p>
                  </div>

                  <div style="background: var(--surface-3); padding: 15px; border-radius: 12px;">
                      <label class="form-label">¿DÓNDE GUARDAR LA COLA?</label>
                      <select id="creator-list-selector" class="form-input" style="margin-bottom: 10px;" onchange="toggleCreatorTitleInput()">
                          <option value="NEW">✨ Crear y Subir Nueva Lista...</option>
                      </select>
                      
                      <input type="text" id="paste-title-input" placeholder="Nombre (Ej: Estrenos 2025)" class="form-input" style="margin-bottom: 15px;">
                      
                      <button id="btn-send-pastebin" onclick="sendToPastebin()" class="btn-primary" style="background: #6366f1; font-size: 16px;">🚀 SUBIR Y REGISTRAR NUEVA LISTA</button>
                  </div>
              </div>
          </div>
      </div>
    </div>

    <div id="sec-editor-raw" class="section">
      <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 10px;">
          <div><div class="page-title">Editor de Listas RAW</div></div>
          <div style="display:flex; gap:10px;">
              <button class="btn-refresh" onclick="sortM3URawContent()">🔤 Orden A-Z</button>
              <button class="btn-add" onclick="saveRawEdit()">💾 Guardar en Pastebin</button>
          </div>
        </div>
      </div>
      <div class="stat-card" style="margin-bottom: 20px;">
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <select id="raw-list-selector" class="form-input" style="flex:1; min-width:200px;" onchange="autoLoadRawFromSelect()">
                  <option value="">Selecciona una lista activa para editar...</option>
              </select>
              <input type="text" id="raw-slug-input" placeholder="O pega el slug (ej: aBcD12)" class="form-input" style="width:200px; flex-grow:1;">
              <button class="btn-secondary" onclick="loadRawForEdit()">Cargar</button>
          </div>
      </div>
      <input type="text" id="raw-title-edit" placeholder="Título de la Lista..." class="form-input" style="margin-bottom:10px; font-weight:bold;">
      <textarea id="raw-content-area" style="height: 550px; font-family: monospace; font-size: 12px; padding:15px; width: 100%; background: var(--surface-3); border: 1px solid var(--border); color: white; border-radius: 8px;"></textarea>
    </div>

    <div id="sec-xui" class="section">
      <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><div class="page-title">Servidores XUI</div></div>
          <button class="btn-add" onclick="openXuiModal()">＋ Añadir Servidor</button>
        </div>
      </div>
      <div id="xui-grid" class="xui-grid"></div>
    </div>

    <div id="sec-info" class="section">
      <div class="page-header"><div class="page-title">Ajustes Generales</div></div>
      <div class="list-card" style="display: block; max-width: 500px;">
        <div class="form-group">
            <label class="form-label">Gmail Pastebin (Para edición)</label>
            <input id="global-pastebin-email" class="form-input" type="email" placeholder="ej: mi_admin@gmail.com">
        </div>
        <div class="form-group">
            <label class="form-label">TMDB API Key</label>
            <input id="global-tmdb" class="form-input" type="text" placeholder="ej: a8314b812e95b9ed31...">
        </div>
        <button class="btn-primary" onclick="saveGlobalSettings()">Guardar Ajustes</button>
      </div>
    </div>
  </main>
</div>

<div id="key-modal" class="modal-overlay" onclick="if(event.target===this)closeKeyModal()"><div class="modal"><div class="modal-header"><div class="modal-title">Generar Key</div><button class="modal-close" onclick="closeKeyModal()">✕</button></div><div class="modal-body"><div class="form-group"><label class="form-label">Cliente</label><input id="key-form-name" class="form-input" type="text"></div><div class="form-row"><div class="form-group"><label class="form-label">Tipo</label><select id="key-form-type" class="form-input" onchange="updateDurationOptions()"><option value="demo">DEMO</option><option value="vip" selected>VIP</option></select></div><div class="form-group"><label class="form-label">Duración</label><select id="key-form-duration" class="form-input"></select></div></div><div class="form-group"><label class="form-label">Servidor</label><select id="key-form-server" class="form-input"></select></div></div><div class="modal-footer"><button class="btn-primary" onclick="generateAndSaveKey()">Generar</button></div></div></div>
<div id="xui-modal" class="modal-overlay" onclick="if(event.target===this)closeXuiModal()"><div class="modal"><div class="modal-header"><div class="modal-title">Servidor XUI</div><button class="modal-close" onclick="closeXuiModal()">✕</button></div><div class="modal-body"><div class="form-group"><label class="form-label">Nombre</label><input id="xui-form-name" class="form-input" type="text"></div><div class="form-group"><label class="form-label">Host</label><input id="xui-form-host" class="form-input" type="text"></div><div class="form-row"><div class="form-group"><label class="form-label">Usuario</label><input id="xui-form-user" class="form-input" type="text"></div><div class="form-group"><label class="form-label">Clave</label><input id="xui-form-pass" class="form-input" type="password"></div></div></div><div class="modal-footer"><button class="btn-primary" onclick="saveXuiServer()">Guardar</button></div></div></div>
<div id="m3u-modal" class="modal-overlay" onclick="if(event.target===this)closeM3uModal()"><div class="modal"><div class="modal-header"><div id="m3u-modal-title" class="modal-title">Lista M3U</div><button class="modal-close" onclick="closeM3uModal()">✕</button></div><div class="modal-body"><div class="form-group"><label class="form-label">Nombre</label><input id="m3u-form-name" class="form-input" type="text"></div><div class="form-group"><label class="form-label">URL RAW</label><input id="m3u-form-url" class="form-input" type="text"></div><div class="form-group"><label class="form-label">Imagen</label><input id="m3u-form-image" class="form-input" type="text"></div><div class="form-group" style="display:flex; align-items:center; gap:10px; margin-top: 10px;"><label class="form-label" style="margin:0;">¿Lista Activa?</label><input id="m3u-form-active" type="checkbox" style="width:18px;height:18px;" checked></div></div><div class="modal-footer"><button class="btn-primary" onclick="saveM3u()">Guardar</button></div></div></div>

<div id="poster-search-modal" class="modal-overlay" onclick="if(event.target===this)closePosterModal()">
    <div class="modal">
        <div class="modal-header">
            <div class="modal-title">Seleccionar Póster para Todos los Servidores</div>
            <button class="modal-close" onclick="closePosterModal()">✕</button>
        </div>
        <div class="modal-body">
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="poster-modal-query" class="form-input" placeholder="Nombre de película...">
                <button onclick="searchPosterInModal()" class="btn-primary" style="width: auto;">Buscar</button>
            </div>
            <div id="poster-modal-results" style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
                </div>
        </div>
    </div>
</div>

<div id="toast"></div>

<script>
  // CONFIG FIREBASE
  const firebaseConfig = {
    apiKey: "AIzaSyC8f2XeezBjHWNk9y3XkEkv5jAWKFnbveQ",
    authDomain: "latino-iptv-pro19.firebaseapp.com",
    projectId: "latino-iptv-pro19",
    storageBucket: "latino-iptv-pro19.firebasestorage.app",
    messagingSenderId: "415911093220",
    appId: "1:415911093220:web:6b3c978d8fd0986dc75df1"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  const auth = firebase.auth();

  let keysList = [];
  let xuiServers = [];
  let m3uLists = [];
  let currentSection = 'dashboard';
  let editingM3uId = null;
  let reactivateId = null;
  let editingXuiId = null;
  let adminPastebinEmail = "";
  
  // CATEGORIAS M3U
  let appCategories = ["Peliculas", "Series", "Novelas", "Animes", "Sagas"];

  // VARIABLES GLOBALES PARA PAGINACIÓN Y FILTROS
  let m3uQueue = [];
  let queueCurrentPage = 1;
  const queueItemsPerPage = 100; 
  let showOnlyNoLogo = false; 

  function toggleSidebar(show) {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if(show) { sidebar.classList.add('open'); overlay.style.display = 'block'; }
      else { sidebar.classList.remove('open'); overlay.style.display = 'none'; }
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-shell').style.display = 'flex';
      document.getElementById('user-email').textContent = user.email;
      loadAll();
    } else {
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('app-shell').style.display = 'none';
    }
  });

  function doLogin() {
    const e = document.getElementById('login-email').value;
    const p = document.getElementById('login-pass').value;
    auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
  }

  function doLogout() {
    auth.signOut();
  }

  function navTo(section) {
    currentSection = section;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.section === section);
    });
    document.querySelectorAll('.section').forEach(el => {
      if(el) el.style.display = el.id === 'sec-' + section ? 'block' : 'none';
    });
    toggleSidebar(false);
  }

  async function loadAll() {
    try {
        await loadCategories();
        await Promise.all([
            loadXuiServers(),
            loadKeys(),
            loadM3uLists(),
            loadGlobalSettings()
        ]);
        navTo(currentSection);
    } catch(e) {
        console.error(e);
        alert("Error cargando panel.");
    }
  }

  async function loadGlobalSettings() {
    try {
        const doc = await db.collection('app_config').doc('settings').get();
        if(doc.exists) {
            adminPastebinEmail = doc.data().pastebinEmail || "";
            const elEmail = document.getElementById('global-pastebin-email');
            if(elEmail) elEmail.value = adminPastebinEmail;
            
            const elTmdb = document.getElementById('global-tmdb');
            if(elTmdb) elTmdb.value = doc.data().tmdbKey || "a8314b812e95b9ed3100552a612c0f7d";
        }
    } catch(e) { console.error("Error al cargar settings", e); }
  }

  async function saveGlobalSettings() {
    try {
        adminPastebinEmail = document.getElementById('global-pastebin-email')?.value.trim() || "";
        const tmdbKey = document.getElementById('global-tmdb')?.value.trim() || "";
        await db.collection('app_config').doc('settings').set({ pastebinEmail: adminPastebinEmail, tmdbKey: tmdbKey }, { merge: true });
        showToast("Ajustes guardados correctamente");
    } catch(e) { alert("Error al guardar: " + e.message); }
  }
  
  async function loadCategories() {
      try {
          const doc = await db.collection('app_config').doc('categories').get();
          if(doc.exists && doc.data().list) {
              appCategories = doc.data().list;
          }
          renderCategorySelects();
      } catch(e) { renderCategorySelects(); }
  }
  function renderCategorySelects() {
      const select = document.getElementById('group-select');
      if(select) select.innerHTML = appCategories.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  async function addNewCategory() {
      const cat = prompt("Ingresa el nombre de la nueva categoría:");
      if(cat && cat.trim() !== "") {
          const cleanCat = cat.trim();
          if(!appCategories.includes(cleanCat)) {
              appCategories.push(cleanCat);
              renderCategorySelects();
              await db.collection('app_config').doc('categories').set({list: appCategories});
              showToast("Categoría agregada");
          }
      }
  }

  async function loadM3uLists() {
    try {
        const snap = await db.collection('m3u_lists').get();
        m3uLists = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const el = document.getElementById('stat-m3u-dash');
        if(el) el.textContent = m3uLists.length;
        renderM3uLists();
        
        // POBLAR SELECTOR DEL EDITOR RAW
        const rawSel = document.getElementById('raw-list-selector');
        if(rawSel) {
            rawSel.innerHTML = '<option value="">Selecciona una lista existente de la App para editar...</option>' + 
            m3uLists.map(l => `<option value="${l.url}">${l.name}</option>`).join('');
        }

        // POBLAR SELECTOR DEL CREADOR (ACTUALIZAR)
        const creatorSel = document.getElementById('creator-list-selector');
        if(creatorSel) {
            creatorSel.innerHTML = '<option value="NEW">✨ Crear y Subir Nueva Lista...</option>' + 
            m3uLists.map(l => `<option value="${l.url}">${l.name}</option>`).join('');
        }

    } catch(e) { console.log(e); }
  }

  function renderM3uLists() {
    const c = document.getElementById('m3u-list-container');
    if(!c) return;
    c.innerHTML = m3uLists.map(l => `
    <div class="list-card ${l.active === false ? 'inactive' : ''}">
      <div class="list-card-left">
        ${l.imageUrl ? `<img src="${l.imageUrl}" class="list-thumb">` : '<div class="list-thumb-placeholder">📋</div>'}
        <div class="list-info">
            <div class="list-name">${l.name}</div>
            <div class="list-url">${l.url}</div>
        </div>
      </div>
      <div class="list-actions">
        <button class="btn-icon" onclick="openEdit('${l.id}')">✏️</button>
        <button class="btn-icon btn-danger" onclick="deleteList('${l.id}')">🗑️</button>
      </div>
    </div>
    `).join('');
  }

  function openAddM3u() {
    editingM3uId = null;
    document.getElementById('m3u-modal-title').textContent = "Añadir Lista M3U Manual";
    document.getElementById('m3u-form-name').value = '';
    document.getElementById('m3u-form-url').value = '';
    document.getElementById('m3u-form-image').value = '';
    document.getElementById('m3u-form-active').checked = true;
    document.getElementById('m3u-modal').style.display = 'flex';
  }

  function openEdit(id) {
    editingM3uId = id;
    const l = m3uLists.find(x => x.id === id);
    document.getElementById('m3u-modal-title').textContent = "Editar Lista M3U";
    document.getElementById('m3u-form-name').value = l.name;
    document.getElementById('m3u-form-url').value = l.url;
    document.getElementById('m3u-form-image').value = l.imageUrl || '';
    document.getElementById('m3u-form-active').checked = l.active !== false;
    document.getElementById('m3u-modal').style.display = 'flex';
  }

  function closeM3uModal() {
    const el = document.getElementById('m3u-modal');
    if(el) el.style.display = 'none';
  }

  async function saveM3u() {
    try {
        const name = document.getElementById('m3u-form-name').value;
        const url = document.getElementById('m3u-form-url').value;
        const imageUrl = document.getElementById('m3u-form-image').value;
        const active = document.getElementById('m3u-form-active').checked;
        if(!name || !url) return alert("Llena los campos requeridos");

        const data = { name, url, imageUrl, active, updatedAt: new Date().toISOString() };

        if(editingM3uId) {
            await db.collection('m3u_lists').doc(editingM3uId).update(data);
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('m3u_lists').add(data);
        }
        closeM3uModal();
        loadM3uLists();
        showToast("Lista Guardada");
    } catch(e) {
        alert("Error al guardar: " + e.message);
    }
  }

  async function deleteList(id) {
    if(confirm("¿Eliminar lista?")) {
        await db.collection('m3u_lists').doc(id).delete();
        loadM3uLists();
    }
  }

  /* --- MULTI-XUI LOGIC --- */
  async function loadXuiServers() {
    try {
        const snap = await db.collection('xui_servers').get();
        xuiServers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const el = document.getElementById('stat-xui-total');
        if(el) el.textContent = xuiServers.length;
        renderXuiGrid();
        populateXuiDropdown();
    } catch(e) { console.log(e); }
  }

  function renderXuiGrid() {
    const grid = document.getElementById('xui-grid');
    if(!grid) return;
    grid.innerHTML = xuiServers.map(s => `
      <div class="xui-card" id="xui-card-${s.id}">
        <div class="xui-card-title">
            ${s.name || 'Servidor XUI'} 
            <div style="display:flex; gap:6px;">
                <button class="btn-icon" style="width:24px;height:24px;font-size:12px" onclick="openEditXui('${s.id}')" title="Editar">✏️</button>
                <button class="btn-icon" style="width:24px;height:24px;font-size:12px" onclick="deleteXuiServer('${s.id}')" title="Eliminar">🗑️</button>
            </div>
        </div>
        <div class="xui-card-host">${s.host}</div>
        <div id="stats-${s.id}" class="xui-loading">Consultando datos del servidor en vivo...</div>
      </div>
    `).join('');

    xuiServers.forEach(server => fetchXuiLiveStats(server.id));
  }

  async function fetchXuiLiveStats(serverId) {
    const server = xuiServers.find(s => s.id === serverId);
    if(!server) return null;
    const statDiv = document.getElementById(`stats-${server.id}`);
    if(statDiv) statDiv.innerHTML = `<span class="xui-loading">Actualizando...</span>`;
    try {
      const url = `${server.host}/player_api.php?username=${server.username}&password=${server.password}`;
      const response = await fetch(url);
      const data = await response.json();
      if(data && data.user_info) {
        const u = data.user_info; 
        const s = data.server_info;
        let daysLeft = "Ilimitado";
        if(u.exp_date && u.exp_date !== "null") {
            const expMs = parseInt(u.exp_date) * 1000;
            daysLeft = Math.max(0, Math.floor((expMs - Date.now()) / 86400000)) + " días";
        }
        if(statDiv) statDiv.innerHTML = `
          <div class="xui-stat-row"><span>Estado:</span> <span class="xui-stat-val" style="color:${u.status==='Active'?'var(--success)':'var(--danger)'}">${u.status}</span></div>
          <div class="xui-stat-row"><span>Conexiones:</span> <span class="xui-stat-val">${u.active_cons} / ${u.max_connections}</span></div>
          <div class="xui-stat-row"><span>Expira en:</span> <span class="xui-stat-val">${daysLeft}</span></div>
          <div class="xui-stat-row"><span>Región:</span> <span class="xui-stat-val">${s.timezone || 'Global'}</span></div>
        `;
      } else {
        if(statDiv) statDiv.innerHTML = `<span style="color:var(--danger)">Credenciales inválidas</span>`;
      }
    } catch (e) {
      if(statDiv) statDiv.innerHTML = `<span style="color:var(--warning)">Sin acceso directo (CORS activo)</span>`;
    }
  }

  function populateXuiDropdown() {
    const sel = document.getElementById('key-form-server');
    if(sel) sel.innerHTML = xuiServers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  function openXuiModal() { 
      editingXuiId = null; 
      document.getElementById('xui-modal-title').textContent = "Nuevo Servidor XUI";
      document.getElementById('xui-form-name').value = '';
      document.getElementById('xui-form-host').value = '';
      document.getElementById('xui-form-user').value = '';
      document.getElementById('xui-form-pass').value = '';
      const el = document.getElementById('xui-modal');
      if(el) el.style.display='flex'; 
  }
  
  function openEditXui(id) {
      editingXuiId = id;
      const s = xuiServers.find(x => x.id === id);
      document.getElementById('xui-modal-title').textContent = "Editar Servidor XUI";
      document.getElementById('xui-form-name').value = s.name || '';
      document.getElementById('xui-form-host').value = s.host || '';
      document.getElementById('xui-form-user').value = s.username || '';
      document.getElementById('xui-form-pass').value = s.password || '';
      const el = document.getElementById('xui-modal');
      if(el) el.style.display='flex';
  }

  function closeXuiModal() { 
      const el = document.getElementById('xui-modal');
      if(el) el.style.display='none'; 
  }
  
  async function saveXuiServer() {
    try {
        let host = document.getElementById('xui-form-host').value.trim();
        const user = document.getElementById('xui-form-user').value.trim();
        if(!host || !user) return alert("Falta host o usuario");

        if(host.includes('/get.php')) {
            host = host.split('/get.php')[0];
        }
        if(host.endsWith('/')) {
            host = host.slice(0, -1);
        }

        const data = {
            name: document.getElementById('xui-form-name').value || "Servidor",
            host: host, username: user,
            password: document.getElementById('xui-form-pass').value.trim(),
            updatedAt: new Date().toISOString()
        };

        if (editingXuiId) {
            await db.collection('xui_servers').doc(editingXuiId).update(data);
            if(xuiServers.length <= 1) {
                await db.collection('app_config').doc('xui').update(data).catch(() => db.collection('app_config').doc('xui').set(data));
            }
        } else {
            data.createdAt = new Date().toISOString();
            await db.collection('xui_servers').add(data);
            if(xuiServers.length === 0) {
                await db.collection('app_config').doc('xui').set(data);
            }
        }
        
        closeXuiModal(); 
        loadXuiServers(); 
        showToast("Servidor Guardado");
    } catch(e) { alert("Error al guardar: " + e.message); }
  }

  async function deleteXuiServer(id) { 
      if(confirm("¿Eliminar servidor? Las keys asociadas quedarán sin servidor.")) { 
          await db.collection('xui_servers').doc(id).delete(); 
          loadXuiServers(); 
      } 
  }

  /* --- KEYS LOGIC --- */
  function openKeyModal() { 
    const el = document.getElementById('key-modal');
    if(el) el.style.display='flex'; 
    updateDurationOptions();
    updateServerLiveStats();
  }
  function closeKeyModal() { 
    const el = document.getElementById('key-modal');
    if(el) el.style.display='none'; 
  }
  
  function updateDurationOptions() {
    const typeEl = document.getElementById('key-form-type');
    if(!typeEl) return;
    const type = typeEl.value;
    const dur = document.getElementById('key-form-duration');
    if(type === 'demo') {
      dur.innerHTML = '<option value="0.5">30 Minutos</option><option value="1">1 Hora</option><option value="24">24 Horas</option>';
    } else {
      dur.innerHTML = '<option value="720">30 Días</option><option value="1440">60 Días</option><option value="0">Ilimitado (Sin caducidad)</option>';
    }
  }

  async function updateServerLiveStats(forceRefresh = false) {
    const sel = document.getElementById('key-form-server');
    if(!sel) return;
    const serverId = sel.value;
    const statsBox = document.getElementById('key-server-stats');
    if(!serverId) { if(statsBox) statsBox.style.display = 'none'; return; }
    if(statsBox) {
        statsBox.style.display = 'block'; 
        statsBox.innerHTML = `<i>Consultando servidor...</i>`;
    }
    const keysInPanel = keysList.filter(k => k.serverId === serverId || (!k.serverId && xuiServers[0]?.id === serverId)).length;
    let liveConnections = `<span style="color:var(--warning)">Desconocido</span>`;
    try {
        const server = xuiServers.find(s => s.id === serverId);
        const url = `${server.host}/player_api.php?username=${server.username}&password=${server.password}`;
        const response = await fetch(url);
        const data = await response.json();
        if(data && data.user_info) liveConnections = `<span style="color:var(--success); font-weight:bold;">${data.user_info.active_cons} de ${data.user_info.max_connections}</span>`;
    } catch(e) { liveConnections = `<span style="color:var(--warning)">CORS activo</span>`; }
    if(statsBox) statsBox.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Pines en Panel:</span> <strong style="color:var(--text)">${keysInPanel}</strong></div><div style="display:flex; justify-content:space-between;"><span>Conectados (XUI):</span> ${liveConnections}</div>`;
    if(forceRefresh) showToast("Actualizado");
  }

  async function loadKeys() {
    try {
        const snap = await db.collection('licenses').get();
        keysList = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
        
        const elTot = document.getElementById('stat-keys-total');
        if(elTot) elTot.textContent = keysList.length;
        
        const elUs = document.getElementById('stat-keys-used');
        if(elUs) elUs.textContent = keysList.filter(k=>k.isUsed).length;
        
        const cExp = document.getElementById('keys-expired-container');
        const cAct = document.getElementById('keys-active-container');
        const cUnu = document.getElementById('keys-unused-container');
        let hExp='', hAct='', hUnu='';
        const now = Date.now();

        keysList.forEach(k => {
        const isUnlimited = k.durationHours === 0 || (!k.durationHours && !k.type);
        const isExpired = k.isUsed && !isUnlimited && k.expiresAt && now >= k.expiresAt;
        const typeLabel = k.type || 'vip';
        
        const srvName = xuiServers.find(x => x.id === k.serverId)?.name || (xuiServers.length > 0 ? xuiServers[0].name : "Servidor Principal");
        const iconType = (typeLabel === 'demo') ? '⏱️' : '👑';
        
        const badge = k.isUsed ? (isExpired ? '<span class="badge badge-off">Expirado</span>' : '<span class="badge badge-on">Activo</span>') : '<span class="badge badge-warning">Nueva</span>';
        const timer = (!k.isUsed || isExpired) ? '' : (isUnlimited ? '<span class="live-timer">Ilimitado</span>' : `<span class="live-timer" data-expires="${k.expiresAt}">...</span>`);
        
        const card = `<div class="list-card ${isExpired ? 'expired':''}">
            <div class="list-card-left">
            <div class="list-thumb-placeholder">${iconType}</div>
            <div class="list-info">
                <div class="owner-name">${k.ownerName || 'Cliente'} <span class="server-badge">${srvName}</span></div>
                <div class="key-text">${k.key}</div>
                <div class="list-meta">${badge} ${timer}</div>
                ${k.deviceId ? `<span class="uuid-text">ID: ${k.deviceId}</span>` : ''}
            </div>
            </div>
            <div class="list-actions">
                ${isExpired ? `<button class="btn-reactivate" onclick="openReactivateModal('${k.id}','${k.ownerName}')">Reactivar</button>` : `<button class="btn-icon" onclick="copyKey('${k.key}')">📋</button>`}
                <button class="btn-icon btn-danger" onclick="deleteKey('${k.id}')">🗑️</button>
            </div>
        </div>`;
        if (!k.isUsed) hUnu += card; else if (isExpired) hExp += card; else hAct += card;
        });
        if(cExp) cExp.innerHTML = hExp || '<p style="color:var(--text-faint)">Vacio</p>';
        if(cAct) cAct.innerHTML = hAct || '<p style="color:var(--text-faint)">Vacio</p>';
        if(cUnu) cUnu.innerHTML = hUnu || '<p style="color:var(--text-faint)">Vacio</p>';
    } catch(e) {}
  }

  setInterval(() => {
    document.querySelectorAll('.live-timer[data-expires]').forEach(el => {
      const exp = el.dataset.expires;
      if(!exp) return;
      const diff = parseInt(exp) - Date.now();
      if(diff <= 0) { el.textContent = "Expirado"; return; }
      const d = Math.floor(diff/(1000*60*60*24)), h = Math.floor((diff/(1000*60*60))%24), m = Math.floor((diff/1000/60)%60);
      el.textContent = `⏱️ ${d}d ${h}h ${m}m`;
    });
  }, 60000);

  async function generateAndSaveKey() {
    try {
        const ownerName = document.getElementById('key-form-name').value.trim();
        const type = document.getElementById('key-form-type').value;
        const durationHours = parseFloat(document.getElementById('key-form-duration').value);
        const serverId = document.getElementById('key-form-server').value;
        
        if (!ownerName) return alert("Nombre requerido");
        if (!serverId && xuiServers.length > 0) return alert("Selecciona servidor");

        const prefix = type === 'demo' ? 'DEMO-' : 'VIP-';
        const key = prefix + Math.random().toString(36).substring(2,6).toUpperCase() + '-' + Math.random().toString(36).substring(2,6).toUpperCase();
        
        await db.collection('licenses').add({ 
            ownerName, key, type, durationHours, serverId: serverId || null,
            isUsed: false, deviceId: null, expiresAt: null, createdAt: new Date().toISOString() 
        });
        closeKeyModal(); loadKeys(); showToast("Key Generada");
    } catch(e) { alert("Error: " + e.message); }
  }

  function openReactivateModal(id, name) { 
      reactivateId = id; 
      const el = document.getElementById('react-name');
      if(el) el.textContent = name; 
      const mod = document.getElementById('reactivate-modal');
      if(mod) mod.style.display = 'flex'; 
  }
  function closeReactivateModal() { 
      const mod = document.getElementById('reactivate-modal');
      if(mod) mod.style.display = 'none'; 
  }
  
  async function processReactivation() {
    try {
        const val = document.getElementById('reactivate-duration').value;
        const h = parseFloat(val);
        await db.collection('licenses').doc(reactivateId).update({ expiresAt: Date.now() + (h * 60 * 60 * 1000), isUsed: true });
        closeReactivateModal(); loadKeys(); showToast("Reactivado");
    } catch(e) { }
  }
  
  async function deleteKey(id) { if(confirm('¿Eliminar Key? El usuario será desconectado en su próximo inicio.')) { await db.collection('licenses').doc(id).delete(); loadKeys(); } }
  function copyKey(t) { navigator.clipboard.writeText(t); showToast("Copiado 📋"); }
  function showToast(m) { 
      const t = document.getElementById('toast'); 
      if(!t) return;
      t.textContent = m; 
      t.classList.add('show'); 
      setTimeout(() => t.classList.remove('show'), 3000); 
  }
  
  // --- NUEVA LÓGICA: CREADOR M3U AVANZADO (TMDB + IMPORTADOR) ---
  const PASTEBIN_API = "https://mpaste.vercel.app/api/paste";
  let selectedMedia = null;

  function extractCleanTitleForSearch(fullTitle) {
      const yearMatch = fullTitle.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;
      
      let clean = fullTitle.replace(/\(\d{4}\)/g, '').replace(/\[.*?\]/g, '').trim();
      clean = clean.replace(/(1080p|720p|4k|hd|cam|latino|subtitulado|castellano|cast|sub|embed|dual|\.mp4|\.mkv|\.avi|\.ts)/gi, '').trim();
      clean = clean.replace(/[\_\-\.]/g, ' ').replace(/\s+/g, ' ').trim();
      
      return { cleanTitle: clean, year: year };
  }

  function switchCreatorTab(tab) {
      document.getElementById('tab-tmdb').style.display = tab === 'tmdb' ? 'block' : 'none';
      document.getElementById('tab-import').style.display = tab === 'import' ? 'block' : 'none';
      document.getElementById('btn-tab-tmdb').className = tab === 'tmdb' ? 'btn-primary' : 'btn-secondary';
      document.getElementById('btn-tab-import').className = tab === 'import' ? 'btn-primary' : 'btn-secondary';
  }

  function toggleCreatorTitleInput() {
      const val = document.getElementById('creator-list-selector').value;
      const titleInput = document.getElementById('paste-title-input');
      const btn = document.getElementById('btn-send-pastebin');
      if (val === "NEW") {
          titleInput.style.display = "block";
          btn.textContent = "🚀 SUBIR Y REGISTRAR NUEVA LISTA";
          btn.style.background = "#6366f1";
      } else {
          titleInput.style.display = "none";
          btn.textContent = "🚀 AÑADIR A LISTA EXISTENTE";
          btn.style.background = "var(--warning)";
      }
  }

  async function searchTMDB() {
    const el = document.getElementById('tmdb-search-input');
    if(!el) return;
    const query = el.value;
    if(!query) return;

    const TMDB_KEY = document.getElementById('global-tmdb')?.value || "a8314b812e95b9ed3100552a612c0f7d";
    const resDiv = document.getElementById('tmdb-results');
    if(resDiv) resDiv.innerHTML = '<p style="color:var(--text-muted)">Buscando...</p>';

    try {
        const { cleanTitle, year } = extractCleanTitleForSearch(query);
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=es&query=${encodeURIComponent(cleanTitle)}`);
        const data = await response.json();
        if(resDiv) resDiv.innerHTML = "";
        
        let results = data.results.filter(r => r.media_type !== 'person');
        
        if (year) {
            results.sort((a, b) => {
                const yA = (a.release_date || a.first_air_date || "").split("-")[0];
                const yB = (b.release_date || b.first_air_date || "").split("-")[0];
                if (yA === year && yB !== year) return -1;
                if (yB === year && yA !== year) return 1;
                return 0;
            });
        }

        results.forEach(item => {
            const date = item.release_date || item.first_air_date || "";
            const itemYear = date ? date.split('-')[0] : "S/F";
            const title = item.title || item.name;
            const poster = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Img';
            
            const div = document.createElement('div');
            div.className = "tmdb-item";
            div.style = "display:flex; gap:12px; background:var(--bg); padding:10px; border-radius:8px; cursor:pointer; border:1px solid var(--border); align-items:center;";
            div.onclick = () => selectTMDBItem(item, title, itemYear, poster);
            div.innerHTML = `<img src="${poster}" style="width:70px; border-radius:6px; object-fit:cover;"><div style="flex:1"><div style="color:white; font-size:15px; font-weight:bold;">${title}</div><div style="color:var(--text-muted); font-size:12px; margin-top:4px;">${item.media_type === 'movie' ? 'Película' : 'Serie'} • ${itemYear}</div></div><div style="color:var(--primary); font-size:18px;">➔</div>`;
            if(resDiv) resDiv.appendChild(div);
        });
    } catch(e) { if(resDiv) resDiv.innerHTML = "Error."; }
  }

  function selectTMDBItem(item, title, year, poster) {
    selectedMedia = { displayTitle: title, displayPoster: poster.replace('w185', 'w500'), year: year };
    
    const form = document.getElementById('m3u-creator-form');
    if(form) form.style.display = "block";
    
    const pPost = document.getElementById('preview-poster');
    if(pPost) pPost.src = poster;
    
    const pTitle = document.getElementById('preview-title');
    if(pTitle) pTitle.textContent = title;
    
    const pYear = document.getElementById('preview-year');
    if(pYear) pYear.textContent = year;

    document.getElementById('group-select').value = (item.media_type === 'tv') ? title : "Peliculas";
  }

  function addToQueue() {
    const elUrl = document.getElementById('video-url-input');
    if(!elUrl) return;
    const url = elUrl.value;
    if(!url) return alert("Pega la URL del video");
    if(!selectedMedia) return alert("Selecciona una película o serie primero");

    m3uQueue.push({
        title: selectedMedia.displayTitle,
        poster: selectedMedia.displayPoster,
        url: url,
        quality: document.getElementById('quality-select')?.value || 'HD',
        lang: document.getElementById('lang-select')?.value || 'Latino',
        group: document.getElementById('group-select')?.value || 'Peliculas',
        isEmbed: document.getElementById('is-embed-check')?.checked || false
    });
    
    queueCurrentPage = 1;
    renderQueue();
    elUrl.value = "";
    showToast("✅ Agregado a la Cola.");
  }

  function processImportM3U() {
      const text = document.getElementById('import-textarea').value;
      if(!text.trim()) return alert("Pega código M3U primero");
      
      const lines = text.split('\n');
      let cLogo = "", cGroup = "Peliculas", cTitle = "", cLang = "Latino", cQual = "HD", cEmbed = false;
      let added = 0;

      for(let i=0; i<lines.length; i++) {
          let line = lines[i].trim();
          if(line.startsWith("#EXTINF:")) {
              const logoM = line.match(/tvg-logo="([^"]*)"/); cLogo = logoM ? logoM[1] : "";
              const groupM = line.match(/group-title="([^"]*)"/); cGroup = groupM ? groupM[1] : "Peliculas";
              const langM = line.match(/tvg-language="([^"]*)"/); cLang = langM ? langM[1] : "Latino";
              const embedM = line.match(/is-embed="([^"]*)"/); cEmbed = embedM ? (embedM[1] === "true") : false;
              
              const qualM = line.match(/tvg-quality="([^"]*)"/);
              if (qualM) {
                  let q = qualM[1].toUpperCase();
                  if (q.includes("FULL HD") || q.includes("FHD")) cQual = "FHD";
                  else if (q.includes("4K") || q.includes("UHD")) cQual = "4K";
                  else if (q.includes("1080") || q.includes("HD")) cQual = "HD"; 
                  else if (q.includes("CAM")) cQual = "CAM";
                  else if (q.includes("SD")) cQual = "SD";
                  else cQual = "HD"; 
              } else {
                  cQual = "HD";
              }
              
              cTitle = line.split(',').pop().trim();
          } else if(line.startsWith("http")) {
              m3uQueue.push({ title: cTitle, poster: cLogo, url: line, quality: cQual, lang: cLang, group: cGroup, isEmbed: cEmbed });
              added++;
          }
      }
      queueCurrentPage = 1;
      renderQueue();
      document.getElementById('import-textarea').value = "";
      alert(`¡Se importaron ${added} videos a la cola!\nCarga rápida completada sin lag.`);
  }

  function removeFromQueue(index) {
      m3uQueue.splice(index, 1);
      renderQueue();
      showToast("🗑️ Película eliminada");
  }

  function toggleNoLogoFilter() {
      showOnlyNoLogo = !showOnlyNoLogo;
      queueCurrentPage = 1; 
      const btn = document.getElementById('btn-filter-logo');
      if (btn) {
          btn.textContent = showOnlyNoLogo ? "Mostrar Todos" : "Ver Sin Logo ⚠️";
          btn.style.background = showOnlyNoLogo ? "var(--surface-3)" : "#eab308";
          btn.style.color = showOnlyNoLogo ? "white" : "black";
      }
      renderQueue();
  }

  async function autoFillMissingLogos() {
      const btn = document.getElementById('btn-autofill-logos');
      if(!btn) return;
      
      const missingTitles = [...new Set(m3uQueue.filter(i => !i.poster || i.poster.trim() === "").map(i => i.title))];
      if (missingTitles.length === 0) return alert("¡No hay películas sin logo en la cola!");
      
      btn.textContent = "⏳ Buscando en TMDB...";
      btn.disabled = true;
      
      const tmdbKey = document.getElementById('global-tmdb')?.value || "a8314b812e95b9ed3100552a612c0f7d";
      let updatedCount = 0;

      for (let rawTitle of missingTitles) {
          const { cleanTitle, year } = extractCleanTitleForSearch(rawTitle);
          try {
              let url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&language=es&query=${encodeURIComponent(cleanTitle)}`;
              let res = await fetch(url);
              let data = await res.json();
              
              if (data.results && data.results.length > 0) {
                  let results = data.results.filter(r => r.media_type !== 'person' && r.poster_path);
                  
                  let bestMatch = results[0];
                  if (year) {
                      const perfectYearMatch = results.find(r => {
                          const rYear = (r.release_date || r.first_air_date || "").split("-")[0];
                          return rYear === year;
                      });
                      if (perfectYearMatch) bestMatch = perfectYearMatch;
                  }

                  if (bestMatch && bestMatch.poster_path) {
                      let posterUrl = `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`;
                      m3uQueue.forEach(item => {
                          if (item.title === rawTitle) item.poster = posterUrl;
                      });
                      updatedCount++;
                  }
              }
          } catch(e) { console.error(e); }
          await new Promise(r => setTimeout(r, 250)); 
      }

      renderQueue();
      btn.textContent = "🤖 Auto-Completar Logos";
      btn.disabled = false;
      alert(`¡Proceso Terminado!\nSe encontraron y aplicaron ${updatedCount} pósters automáticamente.`);
  }

  async function sendToPastebin() {
    if(m3uQueue.length === 0) return alert("Cola vacía");
    if(!adminPastebinEmail) return alert("Configura tu Gmail en Ajustes.");

    const safeJsonParse = async (response) => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Respuesta fallida del servidor:", text);
            throw new Error(`El servidor devolvió un formato no válido (HTTP ${response.status}). Revisa la consola.`);
        }
    };

    const uint8ToBase64Safe = (uint8Array) => {
        let binaryString = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            binaryString += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize));
        }
        return btoa(binaryString);
    };

    let missingMovies = [];
    m3uQueue.forEach(item => {
        if (!item.poster || item.poster.trim() === "") {
            missingMovies.push(item.title);
        }
    });

    if (missingMovies.length > 0) {
        const confirmar = confirm(`🚨 ADVERTENCIA 🚨\n\nTienes ${missingMovies.length} películas sin póster.\n\n¿Estás seguro de que quieres guardar la lista así de todos modos?`);
        if (!confirmar) {
            return;
        }
    }

    const mode = document.getElementById('creator-list-selector') ? document.getElementById('creator-list-selector').value : "NEW";
    const btn = document.getElementById('btn-send-pastebin'); 
    if(btn) { btn.disabled = true; btn.textContent = "🚀 Procesando y Comprimiendo..."; }

    let newM3uContent = "";
    m3uQueue.forEach(i => { 
        newM3uContent += `#EXTINF:-1 tvg-logo="${i.poster}" group-title="${i.group}" tvg-language="${i.lang}" tvg-quality="${i.quality}" is-embed="${i.isEmbed}", ${i.title}\n${i.url}\n`; 
    });

    try {
        if (typeof pako === 'undefined') {
            throw new Error("La librería pako (GZIP) no está cargada. Asegúrate de incluir el script en el HTML.");
        }

        if (mode === "NEW") {
            const titleInput = document.getElementById('paste-title-input');
            const pasteTitle = titleInput && titleInput.value.trim() !== "" ? titleInput.value : "Lista Nueva";
            const fullM3u = "#EXTM3U\n" + newM3uContent;

            const compressedUint8 = pako.gzip(fullM3u);
            const compressedBase64 = uint8ToBase64Safe(compressedUint8);

            const res = await fetch(PASTEBIN_API, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    title: pasteTitle, 
                    compressed: true,
                    content: compressedBase64, 
                    expires: "never", 
                    visibility: "unlisted", 
                    ownerEmail: adminPastebinEmail 
                }) 
            });
            
            const data = await safeJsonParse(res); 
            if(!res.ok) throw new Error(data.error || `Error de red: HTTP ${res.status}`);
            
            const rawUrl = "https://mpaste.vercel.app" + data.raw;
            const firstPoster = m3uQueue.length > 0 ? m3uQueue[0].poster : "";
            
            await db.collection('m3u_lists').add({ 
                name: pasteTitle, url: rawUrl, imageUrl: firstPoster, 
                active: true, type: "mixed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            });
            alert("¡ÉXITO!\nLista NUEVA comprimida, subida a Pastebin y registrada en la App.");
            
        } else {
            const slug = mode.split('/').pop();
            const getRes = await fetch(`https://mpaste.vercel.app/api/paste/${slug}`);
            if (!getRes.ok) throw new Error("No se pudo obtener el archivo RAW para actualizarlo.");
            
            const getData = await safeJsonParse(getRes);
            
            let existingContent = getData.content || "";
            if (!existingContent.includes("#EXTM3U")) existingContent = "#EXTM3U\n" + existingContent;
            
            const updatedContent = existingContent.trim() + "\n" + newM3uContent;
            
            const compressedUint8 = pako.gzip(updatedContent);
            const compressedBase64 = uint8ToBase64Safe(compressedUint8);
            
            const putRes = await fetch(`https://mpaste.vercel.app/api/paste/${slug}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ownerEmail: adminPastebinEmail, 
                    title: getData.title, 
                    compressed: true,
                    content: compressedBase64 
                })
            });
            
            const putData = await safeJsonParse(putRes);
            if (!putRes.ok) throw new Error(putData.error || "No tienes permisos para editar este archivo o error de servidor.");
            
            alert("¡ÉXITO!\nSe añadieron los videos a tu lista existente y fue recomprimida con éxito.");
        }
        
        m3uQueue = [];
        renderQueue();
        if(typeof loadM3uLists === 'function') loadM3uLists(); 
        if(document.getElementById('paste-title-input')) document.getElementById('paste-title-input').value = "";
        
    } catch(e) { 
        alert("Error: " + e.message); 
    } finally { 
        if(btn) {
            btn.disabled = false; 
            if(typeof toggleCreatorTitleInput === 'function') toggleCreatorTitleInput();
            else btn.textContent = "🚀 SUBIR Y REGISTRAR";
        }
    }
  }

  let currentEditingRawTitle = "";
  
  function openPosterModal(index) {
      currentEditingRawTitle = m3uQueue[index].title;
      const { cleanTitle, year } = extractCleanTitleForSearch(currentEditingRawTitle);
      
      document.getElementById('poster-modal-query').value = cleanTitle + (year ? ` ${year}` : "");
      document.getElementById('poster-search-modal').style.display = 'flex';
      searchPosterInModal(); 
  }

  function closePosterModal() {
      document.getElementById('poster-search-modal').style.display = 'none';
  }

  async function searchPosterInModal() {
      const query = document.getElementById('poster-modal-query').value;
      const resDiv = document.getElementById('poster-modal-results');
      if (!query.trim()) return;

      resDiv.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Buscando en TMDB...</p>';
      const tmdbKey = document.getElementById('global-tmdb')?.value || "a8314b812e95b9ed3100552a612c0f7d";
      
      try {
          const { cleanTitle, year } = extractCleanTitleForSearch(query);
          let url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&language=es&query=${encodeURIComponent(cleanTitle)}`;
          let res = await fetch(url);
          let data = await res.json();
          
          resDiv.innerHTML = "";
          const results = data.results.filter(r => r.poster_path && r.media_type !== 'person');
          
          if (results.length === 0) {
              resDiv.innerHTML = '<p style="color:var(--danger); text-align:center;">No se encontró nada con ese nombre.</p>';
              return;
          }

          results.forEach(r => {
              const poster = `https://image.tmdb.org/t/p/w500${r.poster_path}`;
              const title = r.title || r.name;
              const rYear = (r.release_date || r.first_air_date || "").split("-")[0];
              
              resDiv.innerHTML += `
                  <div style="display:flex; gap:12px; align-items:center; background:var(--surface-3); padding:10px; border-radius:8px; cursor:pointer; border:1px solid transparent;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='transparent'" onclick="applyPosterToQueue('${poster}')">
                      <img src="${poster}" style="width:45px; border-radius:4px; object-fit:cover;">
                      <div>
                          <div style="font-weight:bold; color:white;">${title}</div>
                          <div style="font-size:11px; color:var(--text-muted);">${rYear}</div>
                      </div>
                  </div>
              `;
          });
      } catch(e) { resDiv.innerHTML = "Error al conectar con TMDB."; }
  }

  function applyPosterToQueue(posterUrl) {
      m3uQueue.forEach(item => {
          if (item.title === currentEditingRawTitle) item.poster = posterUrl;
      });
      closePosterModal();
      renderQueue();
      showToast("Póster actualizado para todos los servidores 🖼️");
  }

  function renderQueue() {
    const container = document.getElementById('m3u-queue-container');
    if(!container) return;

    if(m3uQueue.length === 0) { 
        container.innerHTML = '<p id="empty-queue-msg" style="color: var(--text-faint); text-align: center; margin-top: 120px;">Cola vacía...</p>';
        return; 
    }
    
    let filtered = m3uQueue.map((item, i) => ({ item, i }));
    if (showOnlyNoLogo) {
        filtered = filtered.filter(obj => !obj.item.poster || obj.item.poster.trim() === "");
    }

    if(filtered.length === 0) {
        container.innerHTML = '<p style="color: var(--text-faint); text-align: center; margin-top: 120px;">No hay películas que coincidan con el filtro actual.</p>';
        return;
    }

    const totalPages = Math.ceil(filtered.length / queueItemsPerPage);
    if (queueCurrentPage > totalPages) queueCurrentPage = totalPages;
    if (queueCurrentPage < 1) queueCurrentPage = 1;

    const startIdx = (queueCurrentPage - 1) * queueItemsPerPage;
    const endIdx = startIdx + queueItemsPerPage;
    const pageItems = filtered.slice(startIdx, endIdx);

    let html = "";
    pageItems.forEach(({item, i}) => {
        html += `
        <div style="background:var(--surface-2); padding:10px; border-radius:8px; margin-bottom:10px; border-left:4px solid ${item.poster ? 'var(--primary)' : 'var(--danger)'}; display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="flex:1; display:flex; flex-direction:column; gap:6px; margin-right:10px;">
                <input type="text" value="${item.title.replace(/"/g, '&quot;')}" onchange="m3uQueue[${i}].title = this.value" class="queue-item-input" style="font-weight:bold; font-size:13px;" title="Título">
                <input type="text" value="${item.group.replace(/"/g, '&quot;')}" onchange="m3uQueue[${i}].group = this.value" class="queue-item-input" style="color:var(--primary);" title="Categoría / Temporada">
                
                <div style="display:flex; gap:5px; margin-top:2px;">
                    <input type="text" value="${item.poster ? item.poster.replace(/"/g, '&quot;') : ''}" onchange="m3uQueue[${i}].poster = this.value; renderQueue();" class="queue-item-input" style="flex:1; color:var(--warning);" placeholder="⚠️ URL del póster (tvg-logo)" title="Póster">
                    <button onclick="openPosterModal(${i})" class="btn-secondary" style="padding:4px 10px; font-size:12px; border:1px solid var(--primary);" title="Buscar/Cambiar Logo">🔍</button>
                </div>
                
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top: 4px;">
                    <select onchange="m3uQueue[${i}].lang = this.value" class="queue-item-input">
                        <option value="Latino" ${item.lang==='Latino'?'selected':''}>Latino</option>
                        <option value="Castellano" ${item.lang==='Castellano'?'selected':''}>Castellano</option>
                        <option value="Sub" ${item.lang==='Sub'?'selected':''}>Subtitulado</option>
                        <option value="Ingles" ${item.lang==='Ingles'?'selected':''}>Inglés</option>
                    </select>
                    <select onchange="m3uQueue[${i}].quality = this.value" class="queue-item-input">
                        <option value="SD" ${item.quality==='SD'?'selected':''}>SD</option>
                        <option value="HD" ${item.quality==='HD'?'selected':''}>HD</option>
                        <option value="FHD" ${item.quality==='FHD'?'selected':''}>FHD</option>
                        <option value="4K" ${item.quality==='4K'?'selected':''}>4K</option>
                        <option value="CAM" ${item.quality==='CAM'?'selected':''}>CAM</option>
                    </select>
                    <label style="font-size:11px; color:white; display:flex; align-items:center; gap:4px;">
                        <input type="checkbox" onchange="m3uQueue[${i}].isEmbed = this.checked" ${item.isEmbed?'checked':''}> Embed
                    </label>
                </div>
            </div>
            <button onclick="removeFromQueue(${i})" style="color:var(--danger); background:none; border:none; cursor:pointer; font-size:20px; padding:4px;" title="Eliminar">✕</button>
        </div>`;
    });
    
    if (totalPages > 1) {
        html += `
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-top:15px; padding-bottom:10px;">
            <button class="btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="changeQueuePage(-1)" ${queueCurrentPage === 1 ? 'disabled' : ''}>⬅️ Anterior</button>
            <span style="font-size:13px; color:white; font-weight:bold;">Página ${queueCurrentPage} de ${totalPages} <span style="color:var(--text-muted);font-weight:normal;">(Filtro: ${filtered.length} pelis)</span></span>
            <button class="btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="changeQueuePage(1)" ${queueCurrentPage === totalPages ? 'disabled' : ''}>Siguiente ➡️</button>
        </div>`;
    }

    container.innerHTML = html;
  }

  function changeQueuePage(dir) {
      queueCurrentPage += dir;
      renderQueue();
  }

  function clearQueue() { m3uQueue = []; renderQueue(); }

  function bulkSetQuality(q) { m3uQueue.forEach(i => i.quality = q); renderQueue(); }
  function bulkSetLang(l) { m3uQueue.forEach(i => i.lang = l); renderQueue(); }
  function bulkSetEmbed(v) { m3uQueue.forEach(i => i.isEmbed = v); renderQueue(); }

  // --- EDITOR RAW ---
  let loadedRawSlug = "";
  function autoLoadRawFromSelect() {
      const sel = document.getElementById('raw-list-selector');
      if(sel && sel.value) {
          document.getElementById('raw-slug-input').value = sel.value.split('/').pop();
          loadRawForEdit();
      }
  }

  async function loadRawForEdit() {
      const el = document.getElementById('raw-slug-input');
      if(!el) return;
      const input = el.value.trim();
      if(!input) return;
      
      loadedRawSlug = input.split('/').pop(); 
      try {
          const res = await fetch(`https://mpaste.vercel.app/api/paste/${loadedRawSlug}`);
          if(!res.ok) throw new Error("Paste no encontrado o no tienes acceso");
          const data = await res.json();
          
          const titleEl = document.getElementById('raw-title-edit');
          if(titleEl) titleEl.value = data.title || "";
          
          const contentEl = document.getElementById('raw-content-area');
          if(contentEl) contentEl.value = data.content || "";
          
          showToast("RAW Cargado Exitosamente");
      } catch(e) { alert(e.message); }
  }

  function sortM3URawContent() {
      const ta = document.getElementById('raw-content-area');
      if(!ta) return;
      const val = ta.value;
      if(!val.includes('#EXTINF')) return showToast("No se encontraron elementos M3U para ordenar");
      
      let lines = val.split('\n');
      let header = lines[0]; 
      let blocks = [];
      let currentBlock = [];

      for(let i=1; i<lines.length; i++) {
          let line = lines[i].trim();
          if(line.startsWith("#EXTINF:")) {
              if(currentBlock.length > 0) blocks.push(currentBlock.join('\n'));
              currentBlock = [line];
          } else if(line !== "") {
              currentBlock.push(line);
          }
      }
      if(currentBlock.length > 0) blocks.push(currentBlock.join('\n'));

      blocks.sort((a,b) => {
          let titleA = a.split('\n')[0].split(',').pop().trim().toLowerCase();
          let titleB = b.split('\n')[0].split(',').pop().trim().toLowerCase();
          return titleA.localeCompare(titleB);
      });

      ta.value = header + "\n" + blocks.join("\n");
      showToast("Lista Ordenada de A-Z");
  }

  // ✅ NUEVO: Lógica de Compresión para evitar límite de 4.5MB en Vercel
  async function saveRawEdit() {
      if(!loadedRawSlug) return alert("Primero carga un RAW válido.");
      if(!adminPastebinEmail) return alert("Configura tu correo en Ajustes Generales primero.");
      
      const uint8ToBase64Safe = (uint8Array) => {
          let binaryString = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
              binaryString += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize));
          }
          return btoa(binaryString);
      };

      try {
          const titleEl = document.getElementById('raw-title-edit');
          const contentEl = document.getElementById('raw-content-area');
          const rawContent = contentEl ? contentEl.value : "";
          
          // Comprimimos el texto antes de enviarlo
          const compressedUint8 = pako.gzip(rawContent);
          const compressedBase64 = uint8ToBase64Safe(compressedUint8);
          
          const res = await fetch(`https://mpaste.vercel.app/api/paste/${loadedRawSlug}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  ownerEmail: adminPastebinEmail, 
                  title: titleEl ? titleEl.value : "", 
                  compressed: true, // Avisamos al backend que va comprimido
                  content: compressedBase64 
              })
          });
          
          if(!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData.error || `Error HTTP ${res.status}: El servidor rechazó los cambios.`);
          }
          showToast("✅ Cambios Guardados en Pastebin");
      } catch(e) { alert("Error al guardar:\n" + e.message); }
  }
</script>
</body>
</html>