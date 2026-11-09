document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const app = document.getElementById('app');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');

    function doLogin() {
        const username = document.getElementById('username').value.trim();
        const dienstnummer = document.getElementById('dienstnummer').value.trim();

        if (!username || !dienstnummer) {
            errorMessage.textContent = 'Bitte Benutzername und Dienstnummer eingeben.';
            errorMessage.hidden = false;
            return;
        }
        const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
        const isAdmin = username === 'Dr.med. Ralf Tieber' && dienstnummer === 'ZTR-01';
        const isBenutzer = benutzerList.some(u => u.name === username && u.dnr === dienstnummer);
        if (!isAdmin && !isBenutzer) {
            errorMessage.textContent = 'Ungültige Anmeldedaten.';
            errorMessage.hidden = false;
            return;
        }
        // Set role based on user
        const user = isAdmin ? { funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' } : benutzerList.find(u => u.name === username);
        const userFunktion = user?.funktion || 'Techniker';
        setTimeout(() => {
            const sidebarRole = document.getElementById('sidebar-role');
            if (sidebarRole) sidebarRole.textContent = userFunktion;
            // Check permissions after role is set
            const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
            const rdNav = document.getElementById('nav-rd');
            if (rdNav) {
                const rdGroup = rdNav.closest('.nav-group');
                if (rdGroup) rdGroup.style.display = allowedRoles.includes(userFunktion) ? 'block' : 'none';
            }
        }, 100);

        errorMessage.hidden = true;

        const displayName = username.replace(/[._]/g, ' ').trim();

        document.getElementById('sidebar-name').textContent = displayName;
        document.getElementById('sidebar-dnr').textContent = dienstnummer;
        document.getElementById('welcome-name').textContent = displayName;

        const parts = displayName.split(/\s+/);
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : displayName.substring(0, 2).toUpperCase();
        document.querySelector('.profile-avatar').textContent = initials;

        loginScreen.style.display = 'none';
        app.hidden = false;
        app.style.display = 'flex';
        
        // Check role for Rettungsdirektion access
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const rdNav = document.getElementById('nav-rd');
        if (rdNav) {
            const rdGroup = rdNav.closest('.nav-group');
            if (rdGroup) rdGroup.style.display = allowedRoles.includes(userRole) ? 'block' : 'none';
        }
        
        showView('uebersicht');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        doLogin();
    });

    const loginBtn = loginForm.querySelector('button[type="submit"]');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            doLogin();
        });
    }

    // Sidebar accordion – robust toggle
    function setGroupOpen(group, open) {
        const sub = group.querySelector('.nav-sub');
        const btn = group.querySelector('.nav-parent');
        if (!sub || !btn) return;

        if (open) {
            group.classList.add('open');
            sub.hidden = false;
            sub.style.display = '';
            // Ensure arrow is down
            if (!btn.textContent.trim().startsWith('▾')) {
                btn.textContent = '▾ ' + btn.textContent.replace(/^[▾▸]\s*/, '');
            }
        } else {
            group.classList.remove('open');
            sub.hidden = true;
            sub.style.display = 'none';
            // Ensure arrow is right
            if (!btn.textContent.trim().startsWith('▸')) {
                btn.textContent = '▸ ' + btn.textContent.replace(/^[▾▸]\s*/, '');
            }
        }
    }

    // Initialize: only groups with class "open" stay open, others closed
    document.querySelectorAll('.nav-group').forEach(group => {
        const isOpen = group.classList.contains('open');
        setGroupOpen(group, isOpen);
    });

    document.querySelectorAll('.nav-parent').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const group = btn.closest('.nav-group');
            if (!group) return;

            const currentlyOpen = group.classList.contains('open');

            // Close all others (accordion style)
            document.querySelectorAll('.nav-group').forEach(g => {
                if (g !== group) setGroupOpen(g, false);
            });

            // Toggle current
            setGroupOpen(group, !currentlyOpen);
        });
    });


    // Calendar placeholder
    document.querySelectorAll('[data-view="kalender"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            // Hide other main sections roughly by showing only calendar
            document.querySelectorAll('.view-panel').forEach(v => v.style.display = 'none');
            const cal = document.getElementById('view-kalender');
            if (cal) {
                cal.style.display = 'block';
                renderCalendar();
            }
            // Highlight menu item
            document.querySelectorAll('.nav-sub-item').forEach(a => a.classList.remove('active'));
            el.classList.add('active');
        });
    });



    document.querySelectorAll('[data-view="uebersicht"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('view-kalender').style.display = 'none';
            document.getElementById('view-uebersicht').style.display = 'block';
            document.querySelector('.welcome-banner').style.display = 'flex';
            document.querySelector('.page-title-row').style.display = 'block';
            document.querySelectorAll('.nav-sub-item').forEach(a => a.classList.remove('active'));
            el.classList.add('active');
        });
    });


    // Calendar
    let calDate = new Date();
    let events = JSON.parse(localStorage.getItem('brw_events') || '[]');

    function saveEvents() {
        localStorage.setItem('brw_events', JSON.stringify(events));
    }

    function renderCalendar() {
        const year = calDate.getFullYear();
        const month = calDate.getMonth();
        const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
        document.getElementById('cal-month-year').textContent = monthNames[month] + ' ' + year;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
        const daysInMonth = lastDay.getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        const today = new Date();
        const isToday = (d, m, y) => d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

        let html = '<div class="cal-day-header">Mo</div><div class="cal-day-header">Di</div><div class="cal-day-header">Mi</div><div class="cal-day-header">Do</div><div class="cal-day-header">Fr</div><div class="cal-day-header">Sa</div><div class="cal-day-header">So</div>';

        // Previous month filler
        for (let i = startWeekday - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            html += `<div class="cal-cell other-month"><div class="cal-date">${d}</div></div>`;
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const cellDate = new Date(year, month, d);
            const todayCls = isToday(d, month, year) ? ' today' : '';
            const dayEvents = events.filter(ev => {
                const start = new Date(ev.start);
                const end = new Date(ev.end);
                return cellDate >= start && cellDate <= end;
            });
            let eventsHtml = '';
            dayEvents.forEach(ev => {
                eventsHtml += `<div class="cal-event ${ev.type}">${ev.title}</div>`;
            });
            html += `<div class="cal-cell${todayCls}" data-date="${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}">
                <div class="cal-date">${d}</div>
                <div class="cal-events">${eventsHtml}</div>
            </div>`;
        }

        // Next month filler
        const totalCells = startWeekday + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        for (let d = 1; d <= remaining; d++) {
            html += `<div class="cal-cell other-month"><div class="cal-date">${d}</div></div>`;
        }

        document.getElementById('calendar-grid').innerHTML = html;
    }

    document.getElementById('cal-prev')?.addEventListener('click', () => {
        calDate.setMonth(calDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
        calDate.setMonth(calDate.getMonth() + 1);
        renderCalendar();
    });
    document.getElementById('cal-today')?.addEventListener('click', () => {
        calDate = new Date();
        renderCalendar();
    });

    // View mode buttons (visual only for now)
    document.querySelectorAll('.cal-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Click on day to add event
    document.getElementById('calendar-grid')?.addEventListener('click', (e) => {
        const cell = e.target.closest('.cal-cell');
        if (!cell || cell.classList.contains('other-month')) return;
        const dateStr = cell.dataset.date;
        if (!dateStr) return;

        const title = prompt('Titel für Urlaub oder Veranstaltung:');
        if (!title) return;
        const type = confirm('Ist das ein Urlaubsantrag? (Abbrechen = Veranstaltung)') ? 'urlaub' : 'veranstaltung';
        const end = prompt('Enddatum (YYYY-MM-DD), leer lassen für nur diesen Tag:', dateStr);

        events.push({
            title: title,
            type: type,
            start: dateStr,
            end: end || dateStr
        });
        saveEvents();
        renderCalendar();
    });

    // View switching
    document.querySelectorAll('[data-view="kalender"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('view-uebersicht').style.display = 'none';
            document.querySelector('.welcome-banner').style.display = 'none';
            document.querySelector('.page-title-row').style.display = 'none';
            const cal = document.getElementById('view-kalender');
            if (cal) {
                cal.style.display = 'block';
                renderCalendar();
            }
            document.querySelectorAll('.nav-sub-item').forEach(a => a.classList.remove('active'));
            el.classList.add('active');
        });
    });



    const viewNames = {
        uebersicht: 'Übersicht',
        kalender: 'Kalender',
        zeus: 'Zeiterfassung (ZEUS)',
        vorschriften: 'Vorschriften',
        urlaub: 'Urlaubsanträge',
        neben: 'Nebenbeschäftigung',
        feedback: 'Feedback',
        einsatz: 'Einsatzdokumentation',
        nachbesprechung: 'Einsatznachbesprechung',
        akademie: 'Rettungsakademie',
        stellen: 'Stellenausschreibungen',
        rangtafel: 'Rangtafel',
        fuhrpark: 'Fuhrparkverwaltung',
        schaden: 'Schadensmeldungen',
        antraege: 'Anträge',
        'rd-anfragen': 'Anfragen',
        'rd-benutzer': 'Neue Benutzer anlegen',
        dienstplan: 'Dienstplan Veranstaltungen'
    };

    function hideAllViews() {
        document.querySelectorAll('.view-panel').forEach(el => el.style.display = 'none');
    }
    function showView(name) {
        document.querySelectorAll('.view-panel').forEach(el => { el.style.display = 'none'; });
        document.getElementById('view-uebersicht').style.display = 'none';
        hideAllViews();
        const views = ['view-uebersicht', 'view-kalender', 'view-zeus', 'view-vorschriften', 'view-urlaub', 'view-neben', 'view-feedback', 'view-einsatz', 'view-nachbesprechung', 'view-akademie', 'view-stellen', 'view-rangtafel', 'view-fuhrpark', 'view-schaden', 'view-rd-anfragen', 'view-rd-benutzer', 'view-antraege', 'view-dienstplan', 'view-rd-funktionen'];
        const bc = document.getElementById('bc-current');
        if (bc && viewNames[name]) bc.textContent = viewNames[name];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === 'view-' + name) ? 'block' : 'none';
        });
        const banner = document.querySelector('.welcome-banner');
        const title = document.querySelector('.page-title-row');
        if (name === 'uebersicht') {
            if (banner) banner.style.display = 'flex';
            if (title) title.style.display = 'block';
        } else {
            if (banner) banner.style.display = 'none';
            if (title) title.style.display = 'none';
        }
        if (name === 'kalender') renderCalendar();
        // Check create permissions
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const hasPermission = allowedRoles.includes(userRole);
        ['kurs-create', 'stelle-create', 'vorschrift-create', 'dp-create'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = hasPermission ? 'block' : 'none';
        });
        if (name === 'rd-benutzer') {
            const saveBtn = document.getElementById('neu-save');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const name = document.getElementById('neu-benutzer')?.value?.trim();
                    const dnr = document.getElementById('neu-dienstnummer')?.value?.trim();
                    const funktion = document.getElementById('neu-funktion')?.value;
                    if (!name || !dnr) { alert('Bitte Name und Dienstnummer angeben.'); return; }
                    if (!window.benutzerList) window.benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
                    window.benutzerList.push({ name, dnr, funktion });
                    localStorage.setItem('brw_benutzer', JSON.stringify(window.benutzerList));
                    document.getElementById('neu-benutzer').value = '';
                    document.getElementById('neu-dienstnummer').value = '';
                    // Update list immediately
                    const list = document.getElementById('benutzer-list');
                    if (list) {
                        const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: 'Techniker' }, ...window.benutzerList];
                        const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
                        list.innerHTML = allUsers.map((u, i) => `
                            <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <strong>${u.name}</strong>
                                    <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                                </div>
                                <div>
                                    <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                                        ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                                    </select>
                                    <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                                </div>
                            </div>
                        `).join('');
                        list.querySelectorAll('.save-user-funktion').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const idx = Number(btn.dataset.idx);
                                const sel = list.querySelector(`.user-funktion[data-idx="${idx}"]`);
                                if (sel) {
                                    const newFunktion = sel.value;
                                    if (idx === 0) {
                                        const sidebarRole = document.getElementById('sidebar-role');
                                        if (sidebarRole) sidebarRole.textContent = newFunktion;
                                        localStorage.setItem('brw_admin_funktion', newFunktion);
                                    }
                                    alert('Funktion gespeichert: ' + newFunktion);
                                }
                            });
                        });
                        // Add save handler for admin
                        list.querySelector('.save-user-funktion')?.addEventListener('click', () => {
                            const sel = list.querySelector('.user-funktion[data-idx="0"]');
                            if (sel) {
                                const newFunktion = sel.value;
                                const sidebarRole = document.getElementById('sidebar-role');
                                if (sidebarRole) sidebarRole.textContent = newFunktion;
                                localStorage.setItem('brw_admin_funktion', newFunktion);
                                alert('Funktion gespeichert: ' + newFunktion);
                            }
                        });
                    }
                    // Update kurs dropdown
                    const kursFuer = document.getElementById('kurs-fuer');
                    if (kursFuer) {
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.textContent = name;
                        kursFuer.appendChild(opt);
                    }
                    // Update count
                    const count = document.getElementById('mitarbeiter-count');
                    if (count) count.textContent = 1 + window.benutzerList.length;
                    alert('Benutzer angelegt: ' + name + ' (' + window.benutzerList.length + ' Benutzer)');
                };
            }
            document.getElementById('neu-save')?.addEventListener('click', () => {
                const name = document.getElementById('neu-benutzer')?.value?.trim();
                const dnr = document.getElementById('neu-dienstnummer')?.value?.trim();
                const funktion = document.getElementById('neu-funktion')?.value;
                if (!name || !dnr) { alert('Bitte Name und Dienstnummer angeben.'); return; }
                if (!window.benutzerList) window.benutzerList = [];
                window.benutzerList.push({ name, dnr, funktion });
                localStorage.setItem('brw_benutzer', JSON.stringify(window.benutzerList));
                // Add to kurs dropdown
                const kursFuer = document.getElementById('kurs-fuer');
                if (kursFuer) {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    kursFuer.appendChild(opt);
                }
                document.getElementById('neu-benutzer').value = '';
                document.getElementById('neu-dienstnummer').value = '';
                alert('Benutzer angelegt: ' + name);
                // Force update the list
                const list = document.getElementById('benutzer-list');
                if (list) {
                    const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: 'Techniker' }, ...(window.benutzerList || [])];
                    list.innerHTML = allUsers.map(u => `<div style="margin-bottom:0.5rem;"><strong>${u.name}</strong> <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span></div>`).join('');
                }
                populateKursDropdown();
                updateMitarbeiterCount();
                renderBenutzer();
            });
            setTimeout(renderBenutzer, 50);
            document.getElementById('save-funktion')?.addEventListener('click', () => {
                const newFunktion = document.getElementById('admin-funktion')?.value;
                if (!newFunktion) return;
                const sidebarRole = document.getElementById('sidebar-role');
                if (sidebarRole) sidebarRole.textContent = newFunktion;
                const funktionSpan = document.querySelector('#benutzer-list span');
                if (funktionSpan) funktionSpan.textContent = 'ZTR-01 · ' + newFunktion;
                localStorage.setItem('brw_admin_funktion', newFunktion);
                alert('Funktion gespeichert: ' + newFunktion);
            });
        }
        window.scrollTo(0, 0);
    }

    document.querySelectorAll('[data-view]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const view = el.dataset.view;
            if (view.startsWith('akademie')) {
                showView('akademie');
                const tab = view === 'akademie' ? 'uebersicht' : view.replace('akademie-', '');
                document.querySelectorAll('[data-akademie]').forEach(b => b.classList.remove('active'));
                const tabBtn = document.querySelector('[data-akademie="' + tab + '"]');
                if (tabBtn) tabBtn.classList.add('active');
                ['uebersicht','kurse','anfragen','verlauf','medea'].forEach(t => {
                    const el = document.getElementById('akademie-' + t);
                    if (el) el.style.display = t === tab ? 'block' : 'none';
                });
            } else {
                showView(view);
            }
            document.querySelectorAll('.nav-sub-item').forEach(a => a.classList.remove('active'));
            el.classList.add('active');
        });
    });



    // ZEUS – entries
    let zeusEntries = JSON.parse(localStorage.getItem('brw_zeus_v2') || '[]');

    function saveZeus() {
        localStorage.setItem('brw_zeus_v2', JSON.stringify(zeusEntries));
    }

    function renderZeusEntries() {
        const tbody = document.getElementById('zeus-entries');
        if (!tbody) return;
        tbody.innerHTML = zeusEntries.map(e => `
            <tr>
                <td>${e.beginn}</td>
                <td>${e.ende || '–'}</td>
                <td>${e.art}</td>
                <td>${e.dauer || '–'}</td>
                <td>${e.status}</td>
            </tr>
        `).join('');
    }

    function addZeusEntry(art, beginn, ende, status) {
        const now = new Date();
        const fmt = (d) => d.toLocaleString('de-AT', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
        let dauer = '–';
        if (beginn && ende) {
            const diff = (new Date(ende) - new Date(beginn)) / 60000;
            if (diff > 0) {
                const h = Math.floor(diff / 60);
                const m = Math.round(diff % 60);
                dauer = h + ':' + String(m).padStart(2, '0') + ' h';
            }
        }
        zeusEntries.unshift({
            beginn: typeof beginn === 'string' ? beginn : fmt(beginn || now),
            ende: ende ? (typeof ende === 'string' ? ende : fmt(ende)) : '–',
            art: art,
            dauer: dauer,
            status: status || 'gestempelt'
        });
        saveZeus();
        renderZeusEntries();
    }

    // Dienstbeginn buttons
    document.querySelectorAll('.zeus-btn').forEach(btn => {
        if (btn.textContent.includes('Dienstbeginn')) {
            btn.addEventListener('click', () => {
                const art = btn.textContent.includes('Einsatzdienst') ? 'Einsatzdienst' : 'Verwaltungsdienst';
                addZeusEntry(art, new Date(), null, 'gestempelt');
                document.querySelector('.zeus-status').textContent = 'Im Dienst (' + art + ').';
            });
        }
    });

    // Nacherfassung form
    const nacherBtn = document.querySelector('.zeus-card button.zeus-btn:not(.primary)');
    if (nacherBtn && nacherBtn.textContent.includes('Freigabe')) {
        nacherBtn.addEventListener('click', () => {
            const card = nacherBtn.closest('.zeus-card');
            const date = card.querySelector('input[type="date"]').value;
            const von = card.querySelectorAll('input[type="time"]')[0].value;
            const bis = card.querySelectorAll('input[type="time"]')[1].value;
            const art = card.querySelector('select').value;
            if (!date || !von || !bis) {
                alert('Bitte Datum, Von und Bis ausfüllen.');
                return;
            }
            const beginn = date + ', ' + von;
            const ende = date + ', ' + bis;
            addZeusEntry(art, beginn, ende, 'zur Freigabe');
            alert('Zur Freigabe eingereicht.');
        });
    }

    // Initial render
    renderZeusEntries();



    // ZEUS Tabs
    document.querySelectorAll('.zeus-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.zeus-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.querySelectorAll('.zeus-content').forEach(c => {
                c.style.display = (c.dataset.tabcontent === target) ? 'block' : 'none';
            });
        });
    });

    // Rückerstattungen
    let rueckAntraege = JSON.parse(localStorage.getItem('brw_rueck') || '[]');

    function saveRueck() {
        localStorage.setItem('brw_rueck', JSON.stringify(rueckAntraege));
    }

    function renderRueck() {
        const list = document.getElementById('rueck-list');
        const count = document.getElementById('rueck-count');
        if (!list) return;
        count.textContent = rueckAntraege.length;
        if (rueckAntraege.length === 0) {
            list.innerHTML = '<p class="mb-empty">Keine Anträge.</p>';
            return;
        }
        list.innerHTML = rueckAntraege.map(a => `
            <div class="rueck-item">
                <strong>${a.art} – ${a.betrag} €</strong>
                <span>${a.datum || '–'} · ${a.zweck || '–'}</span>
            </div>
        `).join('');
    }

    document.getElementById('rueck-submit')?.addEventListener('click', () => {
        const art = document.getElementById('rueck-art').value;
        const betrag = document.getElementById('rueck-betrag').value;
        const datum = document.getElementById('rueck-datum').value;
        const rechnung = document.getElementById('rueck-rechnung').value;
        const fahrzeug = document.getElementById('rueck-fahrzeug').value;
        const zweck = document.getElementById('rueck-zweck').value;

        if (!betrag) {
            alert('Bitte Betrag angeben.');
            return;
        }

        rueckAntraege.unshift({ art, betrag, datum, rechnung, fahrzeug, zweck });
        saveRueck();
        renderRueck();

        // clear form
        document.getElementById('rueck-betrag').value = '';
        document.getElementById('rueck-datum').value = '';
        document.getElementById('rueck-rechnung').value = '';
        document.getElementById('rueck-fahrzeug').value = '';
        document.getElementById('rueck-zweck').value = '';
    });

    renderRueck();



    // Monatsblatt
    let mbDate = new Date();

    function renderMonatsblatt() {
        const year = mbDate.getFullYear();
        const month = mbDate.getMonth();
        const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
        const title = document.getElementById('mb-month-year');
        if (title) title.textContent = monthNames[month] + ' ' + year;

        // Filter entries for this month
        const filtered = zeusEntries.filter(e => {
            const d = new Date(e.beginn.split(',')[0].split('.').reverse().join('-'));
            return d.getFullYear() === year && d.getMonth() === month;
        });

        const list = document.getElementById('mb-list');
        const summary = document.getElementById('mb-summary');
        if (!list) return;

        let einsatz = 0, verwaltung = 0;
        filtered.forEach(e => {
            const mins = e.dauer && e.dauer !== '–' ? 
                (parseInt(e.dauer) * 60 + parseInt(e.dauer.split(':')[1] || 0)) : 0;
            if (e.art === 'Einsatzdienst') einsatz += mins;
            else verwaltung += mins;
        });

        const fmt = (m) => Math.floor(m/60) + ':' + String(m%60).padStart(2,'0');
        if (summary) {
            summary.textContent = `Verwaltungsdienst ${fmt(verwaltung)} h   Einsatzdienst ${fmt(einsatz)} h   Gesamt ${fmt(einsatz+verwaltung)} h`;
        }

        if (filtered.length === 0) {
            list.innerHTML = '<p class="mb-empty">Keine freigegebenen Zeiten in diesem Monat.</p>';
        } else {
            list.innerHTML = filtered.map(e => `
                <div class="mb-entry">
                    <span>${e.beginn} – ${e.ende}</span>
                    <span>${e.art} · ${e.dauer}</span>
                </div>
            `).join('');
        }
    }

    document.getElementById('mb-prev')?.addEventListener('click', () => {
        mbDate.setMonth(mbDate.getMonth() - 1);
        renderMonatsblatt();
    });
    document.getElementById('mb-next')?.addEventListener('click', () => {
        mbDate.setMonth(mbDate.getMonth() + 1);
        renderMonatsblatt();
    });

    // PDF download – generiert Monatsblatt wie im Screenshot
    document.getElementById('mb-pdf')?.addEventListener('click', () => {
        const year = mbDate.getFullYear();
        const month = mbDate.getMonth();
        const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
        const monthName = monthNames[month];

        // Stunden berechnen
        const filtered = zeusEntries.filter(e => {
            const d = new Date(e.beginn.split(',')[0].split('.').reverse().join('-'));
            return d.getFullYear() === year && d.getMonth() === month;
        });
        let einsatz = 0, verwaltung = 0, dienstage = new Set();
        filtered.forEach(e => {
            if (e.dauer && e.dauer !== '–') {
                const parts = e.dauer.split(':');
                const mins = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                if (e.art === 'Einsatzdienst') einsatz += mins;
                else verwaltung += mins;
            }
            if (e.beginn) dienstage.add(e.beginn.split(',')[0]);
        });
        const fmt = (m) => Math.floor(m/60) + ':' + String(m%60).padStart(2,'0');
        const gesamt = einsatz + verwaltung;

        const dnr = document.getElementById('sidebar-dnr')?.textContent || '7054';
        const name = document.getElementById('sidebar-name')?.textContent || 'Ralf Tieber';
        const role = document.querySelector('.profile-role')?.textContent || 'Notfallsanitäter';
        const aktenzahl = 'ZEUS/' + year + '-' + String(month+1).padStart(2,'0') + '/' + dnr;
        const heute = new Date();
        const datumStr = heute.toLocaleDateString('de-AT', {day:'2-digit', month:'2-digit', year:'numeric'});

        const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Monatsblatt Arbeitszeit – ${monthName} ${year}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 0; padding: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #9b1b3a; padding-bottom: 8px; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-bar { width: 5px; height: 52px; background: #9b1b3a; }
  .brand-text { line-height: 1.15; }
  .brand-text .small { font-size: 11px; letter-spacing: 0.5px; color: #333; }
  .brand-text .title { font-size: 18px; font-weight: 700; }
  .brand-text .sub { font-size: 12px; color: #555; }
  .meta { text-align: right; font-size: 13px; line-height: 1.4; }
  .meta strong { font-weight: 600; }
  h1 { font-size: 22px; margin: 0 0 4px 0; }
  .month { font-size: 14px; color: #333; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; }
  th { background: #9b1b3a; color: #fff; text-align: left; padding: 6px 10px; font-weight: 600; font-size: 12px; letter-spacing: 0.3px; }
  td { border: 1px solid #ddd; padding: 8px 10px; vertical-align: top; }
  td.label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.3px; width: 50%; }
  td.value { font-weight: 600; }
  .footer { margin-top: 30px; font-size: 12px; color: #555; }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-bar"></div>
      <div class="brand-text">
        <div class="small">STADT WIEN</div>
        <div class="title">Berufsrettung Wien</div>
        <div class="sub">ZEUS – Zeiterfassung</div>
      </div>
    </div>
    <div class="meta">
      <div><strong>Aktenzahl:</strong> ${aktenzahl}</div>
      <div>Wien, am ${datumStr}</div>
    </div>
  </div>

  <h1>Monatsblatt Arbeitszeit</h1>
  <div class="month">${monthName} ${year}</div>

  <table>
    <tr><th colspan="2">STAMMDATEN</th></tr>
    <tr>
      <td class="label">NAME<br><span class="value">${role} ${name}</span></td>
      <td class="label">DIENSTNUMMER<br><span class="value">${dnr}</span></td>
    </tr>
    <tr>
      <td class="label">MONAT<br><span class="value">${monthName} ${year}</span></td>
      <td class="label">MONATSABSCHLUSS<br><span class="value">offen</span></td>
    </tr>
  </table>

  <table>
    <tr><th colspan="2">SUMMEN</th></tr>
    <tr>
      <td class="label">VERWALTUNGSDIENST<br><span class="value">${fmt(verwaltung)} h</span></td>
      <td class="label">EINSATZDIENST<br><span class="value">${fmt(einsatz)} h</span></td>
    </tr>
    <tr>
      <td class="label">RUFBEREITSCHAFT<br><span class="value">0:00 h</span></td>
      <td class="label">GESAMT (FREIGEGEBEN)<br><span class="value">${fmt(gesamt)} h</span></td>
    </tr>
    <tr>
      <td class="label">NOCH ZUR FREIGABE<br><span class="value">–</span></td>
      <td class="label">DIENSTAGE<br><span class="value">${dienstage.size}</span></td>
    </tr>
    <tr>
      <td colspan="2" class="label">UNTERSCHRIFT BEDIENSTETE/R<br><br><br></td>
    </tr>
  </table>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) { alert('Pop-up blockiert. Bitte Pop-ups erlauben und erneut versuchen.'); return; }
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.print(); }, 300);
    });

    // Re-render monatsblatt when tab is shown
    document.querySelectorAll('.zeus-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.tab === 'monatsblatt') renderMonatsblatt();
        });
    });

    renderMonatsblatt();



    // Vorschriften filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });



    // Urlaubsanträge
    let urlaubAntraege = JSON.parse(localStorage.getItem('brw_urlaub') || '[]');

    function saveUrlaub() {
        localStorage.setItem('brw_urlaub', JSON.stringify(urlaubAntraege));
    }

    function renderUrlaub() {
        const tbody = document.getElementById('urlaub-list');
        if (!tbody) return;
        if (urlaubAntraege.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Keine Anträge.</td></tr>';
            return;
        }
        tbody.innerHTML = urlaubAntraege.map(a => `
            <tr>
                <td>${a.von} – ${a.bis}</td>
                <td>${a.grund || '–'}</td>
                <td style="color:#16a34a;font-weight:600;">Genehmigt</td>
                <td>–</td>
            </tr>
        `).join('');
    }

    document.getElementById('urlaub-open')?.addEventListener('click', () => {
        document.getElementById('urlaub-modal').style.display = 'flex';
    });
    document.getElementById('urlaub-close')?.addEventListener('click', () => {
        document.getElementById('urlaub-modal').style.display = 'none';
    });
    document.getElementById('urlaub-submit')?.addEventListener('click', () => {
        const von = document.getElementById('urlaub-von').value;
        const bis = document.getElementById('urlaub-bis').value;
        const grund = document.getElementById('urlaub-grund').value;
        if (!von || !bis) {
            alert('Bitte Von und Bis angeben.');
            return;
        }
        urlaubAntraege.unshift({ von, bis, grund });
        saveUrlaub();
        renderUrlaub();
        document.getElementById('urlaub-modal').style.display = 'none';
        document.getElementById('urlaub-von').value = '';
        document.getElementById('urlaub-bis').value = '';
        document.getElementById('urlaub-grund').value = '';
    });

    renderUrlaub();



    // Nebenbeschäftigung
    let nebenAntraege = JSON.parse(localStorage.getItem('brw_neben') || '[]');

    function saveNeben() {
        localStorage.setItem('brw_neben', JSON.stringify(nebenAntraege));
    }

    function renderNeben() {
        const tbody = document.getElementById('neben-list');
        if (!tbody) return;
        if (nebenAntraege.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">Keine Anträge.</td></tr>';
            return;
        }
        tbody.innerHTML = nebenAntraege.map(a => `
            <tr>
                <td>${a.arbeitgeber}</td>
                <td>${a.stunden || '–'}</td>
                <td style="color:#16a34a;font-weight:600;">Genehmigt</td>
            </tr>
        `).join('');
    }

    document.getElementById('neben-open')?.addEventListener('click', () => {
        document.getElementById('neben-modal').style.display = 'flex';
    });
    document.getElementById('neben-close')?.addEventListener('click', () => {
        document.getElementById('neben-modal').style.display = 'none';
    });
    document.getElementById('neben-submit')?.addEventListener('click', () => {
        const arbeitgeber = document.getElementById('neben-arbeitgeber').value.trim();
        const beschreibung = document.getElementById('neben-beschreibung').value.trim();
        const stunden = document.getElementById('neben-stunden').value.trim();
        if (!arbeitgeber) {
            alert('Bitte Arbeitgeber / Tätigkeit angeben.');
            return;
        }
        nebenAntraege.unshift({ arbeitgeber, beschreibung, stunden });
        saveNeben();
        renderNeben();
        document.getElementById('neben-modal').style.display = 'none';
        document.getElementById('neben-arbeitgeber').value = '';
        document.getElementById('neben-beschreibung').value = '';
        document.getElementById('neben-stunden').value = '';
    });

    renderNeben();



    document.getElementById('bc-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        showView('uebersicht');
        document.querySelectorAll('.nav-sub-item').forEach(a => a.classList.remove('active'));
        const ueb = document.querySelector('[data-view="uebersicht"]');
        if (ueb) ueb.classList.add('active');
    });



    // Feedback
    let feedbackItems = JSON.parse(localStorage.getItem('brw_feedback') || '[]');

    function saveFeedback() {
        localStorage.setItem('brw_feedback', JSON.stringify(feedbackItems));
    }

    function renderFeedback() {
        const list = document.getElementById('feedback-list');
        if (!list) return;
        if (feedbackItems.length === 0) {
            list.innerHTML = '<p class="mb-empty">Keine Meldungen.</p>';
            return;
        }
        list.innerHTML = feedbackItems.map(f => `
            <div class="rueck-item">
                <strong>${f.kategorie}: ${f.betreff}</strong>
                <span>${f.text}</span>
            </div>
        `).join('');
    }

    document.getElementById('feedback-open')?.addEventListener('click', () => {
        document.getElementById('feedback-modal').style.display = 'flex';
    });
    document.getElementById('feedback-close')?.addEventListener('click', () => {
        document.getElementById('feedback-modal').style.display = 'none';
    });
    document.getElementById('feedback-submit')?.addEventListener('click', () => {
        const kategorie = document.getElementById('feedback-kategorie').value;
        const betreff = document.getElementById('feedback-betreff').value.trim();
        const text = document.getElementById('feedback-text').value.trim();
        if (!betreff || !text) {
            alert('Bitte Betreff und Text ausfüllen.');
            return;
        }
        feedbackItems.unshift({ kategorie, betreff, text });
        saveFeedback();
        renderFeedback();
        document.getElementById('feedback-modal').style.display = 'none';
        document.getElementById('feedback-betreff').value = '';
        document.getElementById('feedback-text').value = '';
    });

    renderFeedback();



    // Einsatzdokumentation + AKH capacity
    let einsatzBerichte = JSON.parse(localStorage.getItem('brw_einsatz') || '[]');
    let akh = JSON.parse(localStorage.getItem('brw_akh') || '{"zna":8,"chir":8,"int":8,"icu":6,"psy":4}');
    const akhMax = { zna:8, chir:8, int:8, icu:6, psy:4 };
    const akhNames = { zna:'ZNA', chir:'CHIR', int:'INT', icu:'ICU', psy:'PSY' };

    function saveEinsatz() {
        localStorage.setItem('brw_einsatz', JSON.stringify(einsatzBerichte));
        localStorage.setItem('brw_akh', JSON.stringify(akh));
    }

    function updateAkhDisplay() {
        document.querySelectorAll('[data-dept]').forEach(el => {
            const d = el.dataset.dept;
            if (akh[d] !== undefined) {
                el.textContent = akhNames[d] + ' ' + akh[d] + '/' + akhMax[d] + ' frei';
            }
        });
        // Also update main overview tags if present
        const mainTags = document.querySelectorAll('.akh-section .akh-tag');
        const labels = ['Zentrale Notaufnahme','Chirurgie / Unfallchirurgie','Innere Medizin','Intensivstation','Psychiatrie'];
        const keys = ['zna','chir','int','icu','psy'];
        mainTags.forEach((el, i) => {
            if (keys[i]) el.textContent = labels[i] + ' ' + akh[keys[i]] + '/' + akhMax[keys[i]] + ' frei';
        });
    }

    function renderEinsatz() {
        const list = document.getElementById('einsatz-list');
        const count = document.getElementById('einsatz-count');
        if (!list) return;
        if (count) count.textContent = einsatzBerichte.length + ' eigene Berichte';
        if (einsatzBerichte.length === 0) {
            list.innerHTML = '<p class="mb-empty">Noch keine eigenen Berichte. Mit „Neuer Bericht“ oben starten.</p>';
            return;
        }
        list.innerHTML = einsatzBerichte.map(b => `
            <div class="rueck-item" style="cursor:pointer;" onclick="this.nextElementSibling?.classList.toggle('hidden')">
                <strong>${b.datum || ''} – Protokoll ${b.nummer || ''}</strong>
                <span>${b.vorname || ''} ${b.nachname || ''} · ${b.code || ''} · ${b.status || 'gespeichert'}</span>
            </div>
            <div class="hidden" style="background:#fff;border:1px solid #999;border-radius:4px;padding:0;margin:-0.5rem 0 0.75rem;font-size:0.72rem;font-family:Arial,sans-serif;">
                <div style="background:#111;color:#fff;text-align:center;padding:0.4rem;font-weight:700;font-size:0.95rem;">EINSATZPROTOKOLL</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.3rem;width:25%;"><strong>Protokoll-Nr.</strong><br>${b.nummer || '–'}</td>
                        <td style="border:1px solid #999;padding:0.3rem;"><strong>Datum</strong><br>${b.datum || '–'} ${b.uhrzeit || ''}</td>
                        <td style="border:1px solid #999;padding:0.3rem;"><strong>Code</strong><br>${b.code || '–'}</td>
                        <td style="border:1px solid #999;padding:0.3rem;"><strong>Erstellt von</strong><br>${b.erstellt || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">PATIENTENDATEN</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Vorname</strong><br>${b.vorname || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Nachname</strong><br>${b.nachname || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Geschlecht</strong><br>${b.geschlecht || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Geburtsdatum</strong><br>${b.geburtsdatum || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Alter</strong><br>${b.alter || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">EINSATZDATEN</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Status</strong><br>${b.status || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Code</strong><br>${b.code || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Rettungsmittel</strong><br>${b.rettungsmittel || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Besatzung</strong><br>${b.besatzung || '–'}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Polizei</strong><br>${b.polizei || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Feuerwehr</strong><br>${b.feuerwehr || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Kostenträger</strong><br>${b.kostentraeger || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Firma</strong><br>${b.firma || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">ZEITEN</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Alarm</strong><br>${b.alarm || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Abfahrt</strong><br>${b.abfahrt || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Ankunft</strong><br>${b.ankunft || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Abfahrt Ort</strong><br>${b.abfahrtOrt || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Ende</strong><br>${b.ende || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">TRANSPORT</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Einsatzort</strong><br>${b.ort || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Abgabeort</strong><br>${b.abgabe || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">ERSTBEFUND</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>AVPU</strong><br>${b.avpu || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>GCS</strong><br>${b.gcs || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>NACA</strong><br>${b.naca || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Bewusstsein</strong><br>${b.bewusstsein || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>AZ</strong><br>${b.allgemeinzustand || '–'}</td>
                    </tr>
                    <tr><td colspan="5" style="border:1px solid #999;padding:0.25rem;"><strong>Vorgefunden</strong><br>${b.vorgefunden || '–'}</td></tr>
                    <tr><td colspan="5" style="border:1px solid #999;padding:0.25rem;"><strong>Verdachtsdiagnose</strong><br>${b.verdachtsdiagnose || '–'}</td></tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">MONITORING</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>EKG</strong><br>${b.ekg || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>RR</strong><br>${b.rr || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>BPM</strong><br>${b.bpm || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>SpO₂</strong><br>${b.spo2 || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>EtCO₂</strong><br>${b.etco2 || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Temp</strong><br>${b.temperatur || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>BZ</strong><br>${b.blutzucker || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>AF</strong><br>${b.atemfrequenz || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">ANAMNESE</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Vorerkrankungen</strong><br>${b.vorerkrankungen || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Medikation</strong><br>${b.medikation || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Allergien</strong><br>${b.allergien || '–'}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Unverträglichkeiten</strong><br>${b.unvertraeglichkeiten || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Mahlzeit</strong><br>${b.mahlzeit || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Risikofaktoren</strong><br>${b.risikofaktoren || '–'}</td>
                    </tr>
                    <tr><td colspan="3" style="border:1px solid #999;padding:0.25rem;"><strong>Anamnese</strong><br>${b.anamnese || '–'}</td></tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">EINSATZBESCHREIBUNG</div>
                <div style="border:1px solid #999;border-top:none;padding:0.3rem;"><strong>Einsatzart:</strong> ${b.einsatzart || '–'}<br><strong>Ablauf:</strong> ${b.einsatzablauf || '–'}</div>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">MASSNAHMEN</div>
                <div style="border:1px solid #999;border-top:none;padding:0.3rem;"><strong>Durchgeführt:</strong> ${b.massnahmen || '–'}<br><strong>Medikamente:</strong> ${b.medikamente || '–'}<br><strong>Sonstige:</strong> ${b.sonstigeMassnahmen || '–'}</div>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">NOTFALLZEIT</div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Notrufzeit</strong><br>${b.notrufzeit || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Beschwerdebeginn</strong><br>${b.beschwerdebeginn || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Unfallzeitpunkt</strong><br>${b.unfallzeitpunkt || '–'}</td>
                        <td style="border:1px solid #999;padding:0.25rem;"><strong>Symptombeginn</strong><br>${b.symptombeginn || '–'}</td>
                    </tr>
                </table>
                <div style="background:#e5e7eb;padding:0.2rem 0.4rem;font-weight:700;border:1px solid #999;border-top:none;">ENDBEFUND</div>
                <div style="border:1px solid #999;border-top:none;padding:0.3rem;"><strong>Zustand:</strong> ${b.endzustand || '–'} · <strong>Bewusstsein:</strong> ${b.endbewusstsein || '–'}<br><strong>Veränderungen:</strong> ${b.veraenderungen || '–'}<br><strong>Übergabe an:</strong> ${b.uebergabe || '–'}</div>
            </div>
        `).join('');
    }

    document.getElementById('einsatz-open')?.addEventListener('click', () => {
        document.getElementById('einsatz-modal').style.display = 'flex';
    });

    // Einsatzprotokoll generieren und in Archiv speichern
    document.getElementById('einsatz-sichtung')?.addEventListener('click', () => {
        const form = document.getElementById('einsatz-modal');
        const get = (sel) => form.querySelector(sel)?.value || '–';
        const getText = (label) => {
            const labels = [...form.querySelectorAll('label')];
            const l = labels.find(el => el.textContent.trim().startsWith(label));
            return l?.nextElementSibling?.value || '–';
        };

        const vorname = getText('Vorname') !== '–' ? getText('Vorname') : '–';
        const nachname = getText('Nachname') !== '–' ? getText('Nachname') : '–';
        const geschlecht = getText('Geschlecht') !== '–' ? getText('Geschlecht') : '–';
        const geburtsdatum = getText('Geburtsdatum') !== '–' ? getText('Geburtsdatum') : '–';
        const alter = getText('Alter') !== '–' ? getText('Alter') + ' J.' : '–';
        const code = document.getElementById('einsatz-code')?.value || '–';
        const nummer = document.getElementById('einsatz-nummer')?.value || '–';
        const datum = document.getElementById('einsatz-datum')?.value || new Date().toISOString().slice(0,10);
        const ort = document.getElementById('einsatz-ort')?.value || '–';
        const abgabe = document.getElementById('einsatz-abgabe')?.value || '–';
        const name = document.getElementById('sidebar-name')?.textContent || 'Ralf Tieber';

        const g = (id) => document.getElementById(id)?.value?.trim() || '–';
        const gt = (label) => {
            const labels = [...form.querySelectorAll('label')];
            const l = labels.find(el => el.textContent.trim().startsWith(label));
            return l?.nextElementSibling?.value?.trim() || '–';
        };
        // Alle Formularfelder sammeln
        const getAll = (label) => {
            const labels = [...form.querySelectorAll('label')];
            const l = labels.find(el => el.textContent.trim().startsWith(label));
            const el = l?.nextElementSibling;
            if (!el) return '–';
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value || '–';
            return '–';
        };
        const getChecked = (label) => {
            const labels = [...form.querySelectorAll('label')];
            return labels.filter(el => el.textContent.trim() === label && el.querySelector('input:checked')).length > 0;
        };
        const einsatzarten = ['Sturz','Verkehrsunfall','Arbeitsunfall','Erkrankung','Reanimation','Psychischer Notfall','Vergiftung','Brandverletzung','Bereitstellung','Ambulanz-/Sicherheitsdienst','Sonstiger Einsatz'].filter(a => getChecked(a)).join(', ') || '–';
        const massnahmenChecked = ['Lagerung','Kühlung','Lokaler Wärmeerhalt','Sauerstoffgabe','Immobilisation','Infusion','i.v.-Zugang','i.o.-Zugang','Beatmung','Defibrillation','Reanimation'].filter(m => getChecked(m)).join(', ') || '–';
        const meds = [...form.querySelectorAll('.med-row')].map(r => {
            const ins = r.querySelectorAll('input');
            const sel = r.querySelector('select');
            const med = ins[0]?.value || '';
            const dos = ins[1]?.value || '';
            const zeit = ins[2]?.value || '';
            const weg = sel?.value || '';
            return med ? (med + ' ' + dos + ' ' + zeit + ' ' + weg).trim() : '';
        }).filter(Boolean).join('; ') || '–';

        const proto = {
            id: Date.now(),
            nummer: nummer !== '–' ? nummer : String(22000 + einsatzBerichte.length + 1),
            datum: datum,
            uhrzeit: getAll('Uhrzeit'),
            code: code,
            vorname, nachname, geschlecht, geburtsdatum, alter,
            ort, abgabe,
            erstellt: name,
            status: 'in Bearbeitung',
            alarm: getAll('Alarmierungszeit'),
            abfahrt: getAll('Abfahrtszeit'),
            ankunft: getAll('Ankunft Einsatzort'),
            abfahrtOrt: getAll('Abfahrt Einsatzort'),
            ende: getAll('Einsatzende'),
            polizei: getAll('Polizei beteiligt'),
            feuerwehr: getAll('Feuerwehr beteiligt'),
            organisationen: getAll('Weitere Organisationen'),
            rettungsmittel: getAll('Einsatzmittel'),
            besatzung: getAll('Besatzung'),
            kostentraeger: getAll('Kostenträger'),
            firma: getAll('Firma / Veranstalter'),
            anamnese: getAll('Anamnese (Freitext)'),
            medikation: getAll('Laufende Medikamente'),
            allergien: getAll('Allergien'),
            vorerkrankungen: getAll('Vorerkrankungen'),
            unvertraeglichkeiten: getAll('Unverträglichkeiten'),
            mahlzeit: getAll('Letzte Mahlzeit / Flüssigkeit'),
            risikofaktoren: getAll('Risikofaktoren'),
            avpu: getAll('AVPU'),
            gcs: getAll('GCS'),
            naca: getAll('NACA'),
            bewusstsein: getAll('Bewusstseinslage'),
            allgemeinzustand: getAll('Allgemeinzustand'),
            vorgefunden: getAll('Wie wurde der Patient vorgefunden?'),
            verdachtsdiagnose: getAll('Verdachtsdiagnose'),
            messwerte: getAll('Messwerte'),
            leitsymptome: getAll('Leitsymptome'),
            arbeitsdiagnose: getAll('Arbeitsdiagnose'),
            einsatzart: einsatzarten,
            einsatzablauf: getAll('Einsatzablauf (Freitext)'),
            ekg: getAll('EKG'),
            rr: getAll('RR'),
            bpm: getAll('BPM / Puls'),
            spo2: getAll('SpO₂'),
            etco2: getAll('EtCO₂'),
            temperatur: getAll('Temperatur'),
            blutzucker: getAll('Blutzucker'),
            atemfrequenz: getAll('Atemfrequenz'),
            massnahmen: massnahmenChecked,
            medikamente: meds,
            sonstigeMassnahmen: getAll('Sonstige Maßnahmen (Freitext)'),
            notrufzeit: getAll('Notrufzeit'),
            beschwerdebeginn: getAll('Beschwerdebeginn'),
            unfallzeitpunkt: getAll('Unfallzeitpunkt'),
            symptombeginn: getAll('Symptombeginn'),
            endzustand: getAll('Zustand bei Übergabe im Krankenhaus'),
            endbewusstsein: getAll('Bewusstseinslage bei Übergabe'),
            veraenderungen: getAll('Veränderungen während des Einsatzes'),
            uebergabe: getAll('An wen wurde der Pat. übergeben und wo')
        };

        einsatzBerichte.unshift(proto);
        saveEinsatz();
        renderEinsatz();
        document.getElementById('einsatz-modal').style.display = 'none';

        // An Discord senden – Protokoll als Bild
        const webhook = 'https://discord.com/api/webhooks/1568982310433329343/Tp6ApKb_3NxgJ-GpB-L5yEG4eLd7cfY2w4wkBeLoR1Q_brikUm825FfydGFpYuSLSx6b';

        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let y = 10;
        const drawHeader = () => {
            ctx.fillStyle = '#111';
            ctx.fillRect(10, y, 980, 32);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('EINSATZPROTOKOLL', 500, y + 21);
            ctx.textAlign = 'left';
            y += 36;
        };
        const drawSection = (title) => {
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(10, y, 980, 22);
            ctx.fillStyle = '#111';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(title, 16, y + 15);
            y += 26;
        };
        const drawCells = (cells, h = 36) => {
            const w = 980 / cells.length;
            cells.forEach((c, i) => {
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect(10 + i * w, y, w, h);
                ctx.fillStyle = '#555';
                ctx.font = 'bold 9px Arial';
                ctx.fillText(c.label, 16 + i * w, y + 13);
                ctx.fillStyle = '#111';
                ctx.font = '11px Arial';
                const val = String(c.value || '–').slice(0, 35);
                ctx.fillText(val, 16 + i * w, y + 27);
            });
            y += h;
        };

        drawHeader();
        drawCells([
            { label: 'Protokoll-Nr.', value: proto.nummer },
            { label: 'Datum', value: (proto.datum || '') + ' ' + (proto.uhrzeit || '') },
            { label: 'Code', value: proto.code },
            { label: 'Erstellt von', value: proto.erstellt }
        ]);
        drawSection('PATIENTENDATEN');
        drawCells([
            { label: 'Vorname', value: proto.vorname },
            { label: 'Nachname', value: proto.nachname },
            { label: 'Geschlecht', value: proto.geschlecht },
            { label: 'Geburtsdatum', value: proto.geburtsdatum },
            { label: 'Alter', value: proto.alter }
        ]);
        drawSection('EINSATZDATEN');
        drawCells([
            { label: 'Status', value: proto.status },
            { label: 'Code', value: proto.code },
            { label: 'Rettungsmittel', value: proto.rettungsmittel },
            { label: 'Besatzung', value: proto.besatzung }
        ]);
        drawCells([
            { label: 'Polizei', value: proto.polizei },
            { label: 'Feuerwehr', value: proto.feuerwehr },
            { label: 'Kostenträger', value: proto.kostentraeger },
            { label: 'Firma', value: proto.firma }
        ]);
        drawSection('ZEITEN');
        drawCells([
            { label: 'Alarm', value: proto.alarm },
            { label: 'Abfahrt', value: proto.abfahrt },
            { label: 'Ankunft', value: proto.ankunft },
            { label: 'Abfahrt Ort', value: proto.abfahrtOrt },
            { label: 'Ende', value: proto.ende }
        ]);
        drawSection('TRANSPORT');
        drawCells([
            { label: 'Einsatzort', value: proto.ort },
            { label: 'Abgabeort', value: proto.abgabe }
        ]);
        drawSection('ERSTBEFUND');
        drawCells([
            { label: 'AVPU', value: proto.avpu },
            { label: 'GCS', value: proto.gcs },
            { label: 'NACA', value: proto.naca },
            { label: 'Bewusstsein', value: proto.bewusstsein },
            { label: 'AZ', value: proto.allgemeinzustand }
        ]);
        drawSection('MONITORING');
        drawCells([
            { label: 'EKG', value: proto.ekg },
            { label: 'RR', value: proto.rr },
            { label: 'BPM', value: proto.bpm },
            { label: 'SpO₂', value: proto.spo2 },
            { label: 'EtCO₂', value: proto.etco2 },
            { label: 'Temp', value: proto.temperatur },
            { label: 'BZ', value: proto.blutzucker },
            { label: 'AF', value: proto.atemfrequenz }
        ]);
        drawSection('ANAMNESE');
        drawCells([
            { label: 'Vorerkrankungen', value: proto.vorerkrankungen },
            { label: 'Medikation', value: proto.medikation },
            { label: 'Allergien', value: proto.allergien }
        ]);
        drawCells([
            { label: 'Unverträglichkeiten', value: proto.unvertraeglichkeiten },
            { label: 'Mahlzeit', value: proto.mahlzeit },
            { label: 'Risikofaktoren', value: proto.risikofaktoren }
        ]);
        drawSection('MASSNAHMEN');
        drawCells([{ label: 'Durchgeführt', value: proto.massnahmen }], 30);
        drawCells([{ label: 'Medikamente', value: proto.medikamente }], 30);
        drawSection('ENDBEFUND');
        drawCells([
            { label: 'Zustand', value: proto.endzustand },
            { label: 'Bewusstsein', value: proto.endbewusstsein },
            { label: 'Übergabe', value: proto.uebergabe }
        ]);

        // Crop canvas to content
        const cropped = document.createElement('canvas');
        cropped.width = 1000;
        cropped.height = y + 15;
        const cctx = cropped.getContext('2d');
        cctx.drawImage(canvas, 0, 0);

        cropped.toBlob((blob) => {
            const fd = new FormData();
            fd.append('file', blob, 'einsatzprotokoll.png');
            fd.append('payload_json', JSON.stringify({
                content: '**Einsatzprotokoll ' + proto.nummer + '** | ' + (proto.vorname || '') + ' ' + (proto.nachname || '') + ' | ' + proto.code
            }));
            fetch(webhook, { method: 'POST', body: fd })
                .then(() => alert('Einsatzprotokoll als Bild an Discord gesendet und im Archiv gespeichert.'))
                .catch(() => alert('Protokoll im Archiv gespeichert. Discord-Versand fehlgeschlagen.'));
        }, 'image/png');
    });

    // Multi-step navigation for Einsatzbericht
    let currentStep = 1;
    const totalSteps = 9;

    function showStep(n) {
        currentStep = n;
        document.querySelectorAll('.doc-step-panel').forEach(p => {
            p.style.display = p.dataset.step == n ? 'block' : 'none';
        });
        document.querySelectorAll('.doc-step').forEach((s, i) => {
            s.classList.toggle('active', i + 1 === n);
            s.classList.toggle('done', i + 1 < n);
        });
        const nextBtn = document.getElementById('einsatz-submit');
        if (nextBtn) nextBtn.textContent = 'Weiter →';
    }

    // Klick auf die Schritt-Buttons oben
    document.querySelectorAll('.doc-step').forEach((step, i) => {
        step.style.cursor = 'pointer';
        step.addEventListener('click', () => showStep(i + 1));
    });

    // Medikamente hinzufügen / entfernen
    function bindMedRemove(btn) {
        btn.addEventListener('click', () => {
            const row = btn.closest('.med-row');
            const list = document.getElementById('med-list');
            if (list && list.querySelectorAll('.med-row').length > 1) {
                row.remove();
            } else {
                // Letzte Zeile leeren statt löschen
                row.querySelectorAll('input').forEach(i => i.value = '');
                row.querySelector('select').value = '–';
            }
        });
    }
    document.querySelectorAll('.med-remove').forEach(bindMedRemove);

    document.getElementById('med-add')?.addEventListener('click', () => {
        const list = document.getElementById('med-list');
        if (!list) return;
        const row = document.createElement('div');
        row.className = 'form-row med-row';
        row.style.cssText = 'align-items:flex-end;margin-bottom:0.4rem;';
        row.innerHTML = `
            <div style="flex:2;"><input type="text" placeholder="Medikament"></div>
            <div style="flex:1.5;"><input type="text" placeholder="Dosierung"></div>
            <div style="flex:1;"><input type="time"></div>
            <div style="flex:1;">
                <select>
                    <option>–</option>
                    <option>i.v.</option>
                    <option>i.m.</option>
                    <option>s.c.</option>
                    <option>p.o.</option>
                    <option>inh.</option>
                </select>
            </div>
            <button type="button" class="med-remove" style="background:#ef4444;color:#fff;border:none;border-radius:6px;width:32px;height:32px;cursor:pointer;font-size:1.1rem;">×</button>
        `;
        list.appendChild(row);
        bindMedRemove(row.querySelector('.med-remove'));
    });

    document.getElementById('einsatz-submit')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        } else {
            // Final submit logic can go here
            alert('Bericht eingereicht (Demo).');
            document.getElementById('einsatz-modal').style.display = 'none';
            showStep(1);
        }
    });

    document.getElementById('einsatz-close2')?.addEventListener('click', () => {
        if (currentStep > 1) showStep(currentStep - 1);
        else document.getElementById('einsatz-modal').style.display = 'none';
    });

    // Reset to step 1 when opening
    document.getElementById('einsatz-open')?.addEventListener('click', () => {
        showStep(1);
    });


    document.getElementById('einsatz-close')?.addEventListener('click', () => {
        document.getElementById('einsatz-modal').style.display = 'none';
    });

    // AAO Einsatzcode – Kategorie + detaillierte Codes
    const aaoData = {
        "01": [
            {code:"01D01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"01D02", fzg:"RTW", text:"Aschfahle oder graue Hautfarbe gemeldet >50"},
            {code:"01D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"01C01", fzg:"RTW", text:"Vermutetes Aortenaneurysma (Zerreißungsschmerz) >50 Jahre"},
            {code:"01C02", fzg:"RTW", text:"Bekanntes Aortenaneurysma"},
            {code:"01C03", fzg:"RTW", text:"Ohnmacht >50 Jahre"},
            {code:"01C04", fzg:"RTW", text:"Frau mit Ohnmacht 12–50 Jahre"},
            {code:"01C05", fzg:"RTW", text:"Mann mit Schmerzen oberh. Bauchnabel >35 Jahre"},
            {code:"01C06", fzg:"RTW", text:"Frau mit Schmerzen oberh. Bauchnabel >45 Jahre"},
            {code:"01C00", fzg:"RTW", text:"Aufwertung"},
            {code:"01A01", fzg:"KTW/KTW-K", text:"Bauchschmerzen"},
            {code:"01A02", fzg:"KTW/KTW-K", text:"Nicht traumatische Hoden-/Leistenschmerzen (Mann)"}
        ],
        "02": [
            {code:"02E01", fzg:"NEF-RTW · AED · FISU", text:"Ineffektive Atmung"},
            {code:"02E00", fzg:"NEF-RTW · AED · FISU", text:"Aufwertung"},
            {code:"02D01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"02D02", fzg:"RTW", text:"Sprachschwierigkeiten zwischen Atemzügen"},
            {code:"02D03", fzg:"RTW", text:"Angriff von Insektenschwarm (Bienen, Wespen, Hornissen …)"},
            {code:"02D04", fzg:"RTW", text:"Schlangenbiss"},
            {code:"02D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"02C01", fzg:"RTW", text:"Atem- oder Schluckbeschwerden"},
            {code:"02C02", fzg:"RTW", text:"Schwere allergische Reaktion – Vorgeschichte"},
            {code:"02C00", fzg:"RTW", text:"Aufwertung"},
            {code:"02B01", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"02B00", fzg:"RTW", text:"Aufwertung"},
            {code:"02A01", fzg:"TEWEB · KTW/KTW-K", text:"Keine Atem- oder Schluckbeschwerden (Ausschlag/Juckreiz möglich)"},
            {code:"02A02", fzg:"TEWEB · KTW/KTW-K", text:"Spinnenbiss"}
        ],
        "03": [
            {code:"03D01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"03D02", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"03D03", fzg:"NEF-RTW", text:"Bewusstseinstrübung"},
            {code:"03D04", fzg:"RTW", text:"Verletzung im Brust-/Halsbereich (mit Atembeschwerden)"},
            {code:"03D05", fzg:"RTW", text:"Gefährliche Körperregion"},
            {code:"03D06", fzg:"RTW", text:"Großes Tier"},
            {code:"03D07", fzg:"RTW", text:"Exotisches Tier"},
            {code:"03B02", fzg:"NKT", text:"Starke Blutung"},
            {code:"03B03", fzg:"NKT", text:"Unbekannter Zustand"},
            {code:"03B00", fzg:"NKT", text:"Aufwertung"},
            {code:"03A01", fzg:"KTW/KTW-K", text:"Ungefährliche Körperregion mit Fehlstellung"},
            {code:"03A02", fzg:"KTW/KTW-K", text:"Ungefährliche Körperregion"},
            {code:"03A03", fzg:"TEWEB", text:"Verletzungen (≥6h, ohne Notfallleitsymptome)"},
            {code:"03A04", fzg:"TEWEB", text:"Oberflächliche Bisswunde"}
        ],
        "04": [
            {code:"04D01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"04D02", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"04D03", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"04D04", fzg:"NEF-RTW / RTW", text:"Verletzung im Brust-/Halsbereich (mit Atembeschwerden)"},
            {code:"04D05", fzg:"RTW · FISU · 2.RTW", text:"Mehrere Verletzte"},
            {code:"04D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"04B01", fzg:"RTW", text:"Möglicherweise gefährliche Körperregion"},
            {code:"04B02", fzg:"RTW", text:"Starke Blutung"},
            {code:"04B03", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"04B00", fzg:"RTW", text:"Aufwertung"},
            {code:"04A01", fzg:"RTW", text:"Ungefährliche Körperregion mit Fehlstellung"},
            {code:"04A02", fzg:"KTW/KTW-K", text:"Ungefährliche Körperregion"},
            {code:"04A03", fzg:"KTW/KTW-K", text:"Ältere Verletzungen (≥6h)"},
            {code:"KZUG_04D00", fzg:"K-ZUG · RTW · FISU", text:"Körperverletzung/Raufhandel – Größeres Ereignis"}
        ],
        "05": [
            {code:"05D01", fzg:"RTW · FISU", text:"Bewusstseinstrübung"},
            {code:"05D02", fzg:"RTW · FISU", text:"Aschfahle oder graue Hautfarbe gemeldet ≥50"},
            {code:"05D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"05C01", fzg:"RTW", text:"Vermutetes Aortenaneurysma (Zerreißungsschmerz) >50 Jahre"},
            {code:"05C02", fzg:"RTW", text:"Bekanntes Aortenaneurysma"},
            {code:"05C03", fzg:"RTW", text:"Ohnmacht/Beinahe-Ohnmacht ≥50"},
            {code:"05C04", fzg:"RTW", text:"Atembeschwerden"},
            {code:"05C00", fzg:"RTW", text:"Aufwertung"},
            {code:"05A01", fzg:"1450/KTW-K", text:"Nicht traumatische Rückenschmerzen"},
            {code:"05A02", fzg:"1450/KTW-K", text:"Ältere (≥6h) traumatische Rückenschmerzen (ohne Notfallleitsymptome)"}
        ],
        "06": [
            {code:"06E01", fzg:"NEF-RTW · AED · FISU", text:"Ineffektive Atmung"},
            {code:"06E00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"06D01", fzg:"NEF-RTW", text:"Bewusstseinstrübung"},
            {code:"06D02", fzg:"RTW", text:"Sprachschwierigkeiten zwischen Atemzügen"},
            {code:"06D03", fzg:"RTW", text:"Veränderte Hautfarbe"},
            {code:"06D04", fzg:"RTW", text:"Kaltschweißig"},
            {code:"06D05", fzg:"RTW", text:"Tracheostomaproblem"},
            {code:"06D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"06C01", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"06C02", fzg:"RTW", text:"Tracheostomaproblem (keine offensichtliche Atemnot)"}
        ],
        "07": [
            {code:"07E01", fzg:"NEF-RTW · FISU", text:"Brennende Person"},
            {code:"07E00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"07D01", fzg:"RTW · FISU · 2.RTW", text:"Mehrere Verletzte"},
            {code:"07D02", fzg:"NEF-RTW · FISU · AED", text:"Kreislaufstillstand"},
            {code:"07D03", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"07D04", fzg:"NEF-RTW", text:"Bewusstseinstrübung"},
            {code:"07D05", fzg:"RTW", text:"Sprachschwierigkeiten zwischen Atemzügen"},
            {code:"07D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"07C01", fzg:"K-ZUG · FISU · RTW · OA", text:"Gebäudebrand mit eingeschlossenen Person(en)"},
            {code:"07C02", fzg:"RTW", text:"Atembeschwerden"},
            {code:"07C03", fzg:"NEF-RTW", text:"Verbrennungen ≥18% Körperoberfläche"},
            {code:"07C04", fzg:"NEF-RTW", text:"Schwere Verbrennung im Gesicht"},
            {code:"07C00", fzg:"RTW · FISU", text:"Aufwertung"},
            {code:"07B02", fzg:"NKT", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"07B00", fzg:"NKT · FISU", text:"Aufwertung"},
            {code:"07A01", fzg:"NKT · KTW-K", text:"Verbrennungen <18% Körperoberfläche"},
            {code:"07A02", fzg:"RTW", text:"Brandalarm (unklare Situation)"},
            {code:"07A03", fzg:"TEWEB · KTW/KTW-K", text:"Geringfügige Verbrennungen"},
            {code:"07A04", fzg:"TEWEB/KTW-K", text:"Sonnenbrand"},
            {code:"07A05", fzg:"TEWEB/KTW-K", text:"Ältere (≥6h) Verbrennungen/Verletzungen (ohne Notfallleitsymptome)"}
        ],
        "08": [
            {code:"08D01", fzg:"NEF-RTW · AED · FISU · ABC", text:"Kreislaufstillstand"},
            {code:"08D02", fzg:"NEF-RTW · FISU · ABC", text:"Bewusstlos"},
            {code:"08D03", fzg:"NEF-RTW · FISU · ABC", text:"Bewusstseinstrübung"},
            {code:"08D04", fzg:"RTW · FISU · ABC", text:"Sprachschwierigkeiten zwischen Atemzügen"},
            {code:"08D05", fzg:"NEF-RTW · FISU · 2.RTW · OA", text:"Mehrere Verletzte"},
            {code:"08D06", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"08C00", fzg:"NEF-RTW · ABC", text:"Aufwertung"},
            {code:"08B01", fzg:"RTW · ABC", text:"Wach ohne Atembeschwerden"},
            {code:"08B00", fzg:"RTW · ABC", text:"Aufwertung"},
            {code:"08A01", fzg:"KTW", text:"Kohlenmonoxid-Alarm (Person ohne Notfallleitsymptome vor Ort)"},
            {code:"08A02", fzg:"KTW", text:"Kohlenmonoxid-Alarm (automatischer Alarm)"},
            {code:"KZUG_08D00", fzg:"K-ZUG · RTW · FISU · OA", text:"Gefahrenstoffaustritt"},
            {code:"KZUG_08D00K", fzg:"K-ZUG · RTW · FISU · OA", text:"Kohlenmonoxidaustritt/CO-Alarm"}
        ],
        "09": [
            {code:"09E01", fzg:"NEF-RTW · AED · FISU", text:"Atemstillstand"},
            {code:"09E02", fzg:"NEF-RTW · AED · FISU", text:"Ungewisse Atmung (Agonal)"},
            {code:"09E03", fzg:"NEF-RTW · AED · FISU", text:"Erhängen"},
            {code:"09E04", fzg:"NEF-RTW · AED · FISU", text:"Strangulierung"},
            {code:"09E05", fzg:"NEF-RTW · AED · FISU", text:"Ersticken – äußere Einflüsse"},
            {code:"09E00", fzg:"NEF-RTW · AED · FISU", text:"Aufwertung"},
            {code:"09D01", fzg:"NEF-RTW · AED · FISU", text:"Ineffektive Atmung"},
            {code:"09D02", fzg:"NEF-RTW", text:"Offensichtlicher oder erwarteter Tod – zweifelhaft"},
            {code:"09D00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"09B01", fzg:"MA15", text:"Offensichtlich tote Person – unzweifelhaft"},
            {code:"09B00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"09O01", fzg:"MA15", text:"Erwarteter Tod – unzweifelhaft"}
        ],
        "10": [
            {code:"10D01", fzg:"NEF-RTW", text:"Bewusstseinstrübung"},
            {code:"10D02", fzg:"NEF-RTW", text:"Sprachschwierigkeiten zwischen Atemzügen"},
            {code:"10D03", fzg:"NEF-RTW", text:"Veränderte Hautfarbe"},
            {code:"10D04", fzg:"NEF-RTW", text:"Kaltschweißig"},
            {code:"10D05", fzg:"NEF-RTW", text:"Herzinfarkt/Angina Pectoris – Vorgeschichte"},
            {code:"10D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"10C01", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"10C02", fzg:"RTW", text:"Kokainmissbrauch"},
            {code:"10C03", fzg:"RTW", text:"Normale Atmung >35 Jahre"},
            {code:"10C00", fzg:"RTW", text:"Aufwertung"},
            {code:"10A01", fzg:"NKT", text:"Normale Atmung <35"}
        ],
        "11": [
            {code:"11E01", fzg:"NEF-RTW · AED · FISU", text:"Komplette Atemwegsverlegung / Ineffektive Atmung"},
            {code:"11E00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"11D01", fzg:"NEF-RTW", text:"Abnorme Atmung (teilweise Atemwegsverlegung)"},
            {code:"11D02", fzg:"NEF-RTW", text:"Bewusstseinstrübung"},
            {code:"11D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"11A01", fzg:"TEWEB/KTW-K", text:"Keine Atemwegsverlegung (kann reden/schreien, wach, atmet normal)"}
        ],
        "12": [
            {code:"12D01", fzg:"NEF-RTW · AED · FISU", text:"Atemstillstand (nach den Schlüsselfragen)"},
            {code:"12D02", fzg:"RTW", text:"Andauernder oder multiple Krampfanfälle"},
            {code:"12D03", fzg:"NEF-RTW · AED · FISU", text:"Agonale/Ineffektive Atmung"},
            {code:"12D04", fzg:"RTW", text:"Effektive Atmung nicht überprüft ≥35"},
            {code:"12D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"12C01", fzg:"RTW", text:"Fokaler/Absence-Krampfanfall (nicht ansprechbar)"},
            {code:"12C02", fzg:"NEF-RTW", text:"Schwangerschaft"},
            {code:"12C03", fzg:"RTW", text:"Diabetiker"},
            {code:"12C04", fzg:"RTW", text:"Nicht mehr krampfend, effektive Atmung überprüft (>6, keine Epilepsie bestätigt)"},
            {code:"12C05", fzg:"RTW", text:"Schlaganfall oder Gehirntumor – Vorgeschichte"},
            {code:"12C06", fzg:"RTW", text:"Überdosis/Vergiftung (Einnahme)"},
            {code:"12C07", fzg:"RTW", text:"Atypischer Krampfanfall"},
            {code:"12C00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"12B01", fzg:"RTW", text:"Effektive Atmung nicht überprüft <35"},
            {code:"12B00", fzg:"RTW", text:"Aufwertung"},
            {code:"12A01", fzg:"KTW/KTW-K", text:"Nicht mehr krampfend, effektive Atmung überprüft (bekannte Epilepsie)"},
            {code:"12A02", fzg:"KTW/KTW-K", text:"Nicht mehr krampfend, effektive Atmung überprüft (Epilepsie unbekannt)"},
            {code:"12A03", fzg:"NKT", text:"Nicht mehr krampfend, effektive Atmung überprüft (≤6, keine Epilepsie bestätigt)"},
            {code:"12A04", fzg:"KTW/KTW-K", text:"Fokaler/Absence-Krampfanfall (ansprechbar)"}
        ],
        "13": [
            {code:"13D01", fzg:"RTW", text:"Bewusstlos"},
            {code:"13D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"13C01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"13C02", fzg:"RTW", text:"Abnormales Verhalten"},
            {code:"13C03", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"13C00", fzg:"RTW", text:"Aufwertung"},
            {code:"13A01", fzg:"KTW/KTW-K", text:"Ansprechbar und verhält sich normal"}
        ],
        "14": [
            {code:"14E01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand (nicht mehr im Wasser)"},
            {code:"14E02", fzg:"NEF-RTW · AED · FISU", text:"Unter Wasser (keine Spezialkräfte erforderlich)"},
            {code:"14E00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"14D01", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"14D02", fzg:"NEF-RTW · AED · FISU", text:"Unter Wasser (Spezialkräfte erforderlich)"},
            {code:"14D03", fzg:"RTW", text:"Gestrandet (Spezialkräfte erforderlich)"},
            {code:"14D06", fzg:"RTW", text:"Verdacht auf HWS-Verletzung"},
            {code:"14D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"14C01", fzg:"RTW", text:"Ansprechbar mit abnormer Atmung"},
            {code:"14C00", fzg:"RTW", text:"Aufwertung"},
            {code:"14B01", fzg:"RTW", text:"Ansprechbar und normale Atmung (Verletzungen oder im Wasser)"},
            {code:"14B02", fzg:"MA15", text:"Offensichtlich tote Person (Unterwasserzeit ≥6h)"},
            {code:"14B03", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"14B00", fzg:"RTW", text:"Aufwertung"},
            {code:"14A01", fzg:"RTW", text:"Ansprechbar und normale Atmung (keine Verletzungen, nicht im Wasser)"}
        ],
        "15": [
            {code:"15E01", fzg:"NEF-RTW · AED · FISU", text:"Atemstillstand / Ineffektive Atmung"},
            {code:"15E00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"15D01", fzg:"NEF-RTW · FISU · 2.RTW · OA", text:"Mehrere Verletzte"},
            {code:"15D02", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"15D03", fzg:"NEF-RTW · FISU", text:"Patient noch nicht von der Stromquelle getrennt"},
            {code:"15D04", fzg:"NEF-RTW · FISU", text:"Stromzufuhr nicht unterbrochen oder Gefahr besteht"},
            {code:"15D05", fzg:"NEF-RTW · FISU", text:"Sturz aus extremer Höhe (≥10 m)"},
            {code:"15D06", fzg:"NEF-RTW · FISU", text:"Sturz aus großer Höhe"},
            {code:"15D07", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"15D08", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"15D09", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"15D00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"15C01", fzg:"RTW", text:"Ansprechbar und normale Atmung"}
        ],
        "16": [
            {code:"16D01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"16D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"16B01", fzg:"RTW", text:"Schwere Augenverletzungen"},
            {code:"16B00", fzg:"RTW", text:"Aufwertung"},
            {code:"16A01", fzg:"NKT", text:"Mäßige Augenverletzungen"},
            {code:"16A02", fzg:"KTW/KTW-K", text:"Geringfügige Augenverletzungen"},
            {code:"16A03", fzg:"TEWEB · KTW-K", text:"Medizinische Ursache"}
        ],
        "17": [
            {code:"17D01", fzg:"NEF-RTW · FISU", text:"Sturz aus extremer Höhe (≥10 m)"},
            {code:"17D02", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"17D03", fzg:"NEF-RTW · AED · FISU", text:"Bewusstlos"},
            {code:"17D04", fzg:"NEF-RTW / RTW", text:"Bewusstseinstrübung"},
            {code:"17D05", fzg:"NEF-RTW / RTW · FISU", text:"Verletzung im Brust- oder Halsbereich (mit Atembeschwerden)"},
            {code:"17D06", fzg:"NEF-RTW · FISU", text:"Sturz aus großer Höhe (3–9 m)"},
            {code:"17D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"17B03", fzg:"NKT", text:"Treppe hinunterstürzen (nicht Sturz auf Treppe)"},
            {code:"17B04", fzg:"NKT", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"17B00", fzg:"RTW", text:"Aufwertung"},
            {code:"17A01", fzg:"NKT", text:"Ungefährliche Körperregion mit Fehlstellung"},
            {code:"17A02", fzg:"KTW/KTW-K", text:"Ungefährliche Körperregion"},
            {code:"17A03", fzg:"KTW", text:"Ältere (≥6h) Verletzung (ohne Notfallleitsymptome)"},
            {code:"17A04", fzg:"KTW/KTW-K", text:"Allgemeine Hilfe (keine Verletzungen, keine Notfallleitsymptome)"}
        ],
        "18": [
            {code:"18C01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"18C02", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"18C03", fzg:"RTW", text:"Sprachstörungen"},
            {code:"18C04", fzg:"RTW", text:"Plötzliches Einsetzen von starken Schmerzen"},
            {code:"18C05", fzg:"RTW", text:"Taubheitsgefühl"},
            {code:"18C06", fzg:"RTW", text:"Lähmungserscheinungen"},
            {code:"18C07", fzg:"RTW", text:"Verändertes Verhalten (<3h)"},
            {code:"18C00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"18B01", fzg:"NKT", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"18B00", fzg:"NKT", text:"Aufwertung"},
            {code:"18A01", fzg:"TEWEB", text:"Normale Atmung"}
        ],
        "19": [
            {code:"19D01", fzg:"NEF-RTW", text:"Bewusstseinstrübung"},
            {code:"19D02", fzg:"NEF-RTW", text:"Sprachschwierigkeiten zwischen Atemzügen"},
            {code:"19D03", fzg:"NEF-RTW", text:"Veränderte Hautfarbe"},
            {code:"19D04", fzg:"NEF-RTW", text:"Kaltschweißig"},
            {code:"19D05", fzg:"NEF-RTW · FISU", text:"Soeben wiederbelebt und/oder defibrilliert (äußerlich)"},
            {code:"19D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"19C01", fzg:"NEF-RTW", text:"Implantierter Defibrillator (ICD) löst aus"},
            {code:"19C02", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"19C03", fzg:"RTW", text:"Brustschmerzen/Beschwerden in der Brust ≥35"},
            {code:"19C04", fzg:"RTW", text:"Bekanntes Herzleiden"},
            {code:"19C05", fzg:"RTW", text:"Kokainmissbrauch"},
            {code:"19C06", fzg:"RTW", text:"Puls <50 oder Puls ≥130 (ohne Notfallleitsymptome)"},
            {code:"19C07", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"19C00", fzg:"RTW", text:"Aufwertung"},
            {code:"19A01", fzg:"1450/KTW-K", text:"Puls ≥50 und <130 (ohne Notfallleitsymptome)"}
        ],
        "20": [
            {code:"20D01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"20D02", fzg:"RTW · FISU · 2.RTW", text:"Mehrere Verletzte (mit Notfallleitsymptomen)"},
            {code:"20D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"20C01", fzg:"RTW", text:"Herzinfarkt/Angina Pectoris – Vorgeschichte"},
            {code:"20C00", fzg:"RTW", text:"Aufwertung"},
            {code:"20B01", fzg:"NKT", text:"Änderung der Hautfarbe"},
            {code:"20B02", fzg:"NKT", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"20B00", fzg:"NKT", text:"Aufwertung"},
            {code:"20A01", fzg:"TEWEB", text:"Ansprechbar"}
        ],
        "21": [
            {code:"21D01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"21D02", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"21D03", fzg:"NEF-RTW / RTW", text:"Bewusstseinstrübung"},
            {code:"21D04", fzg:"RTW", text:"Gefährliche Blutung"},
            {code:"21D05", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"21D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"21C01", fzg:"RTW", text:"Blutung aus künstlichen Körperöffnungen"},
            {code:"21C02", fzg:"RTW", text:"Blutung aus Dialyseshunt"},
            {code:"21C03", fzg:"RTW", text:"Blutung aus Krampfadern"},
            {code:"21C00", fzg:"RTW", text:"Aufwertung"},
            {code:"21B01", fzg:"RTW", text:"Möglicherweise gefährliche Blutung"},
            {code:"21B02", fzg:"RTW", text:"Starke Blutung"},
            {code:"21B03", fzg:"RTW", text:"Bluter"},
            {code:"21B04", fzg:"RTW", text:"Blutverdünnende Medikamente"},
            {code:"21B00", fzg:"NKT", text:"Aufwertung"},
            {code:"21A01", fzg:"TEWEB", text:"Ungefährliche Blutung"},
            {code:"21A02", fzg:"TEWEB", text:"Schwache Blutung"}
        ],
        "22": [
            {code:"22D01", fzg:"NEF-RTW · K-1 · FISU", text:"Mechanische oder maschinelle Einklemmung"},
            {code:"22D02", fzg:"NEF-RTW · K-1 · FISU", text:"Grabeneinsturz"},
            {code:"22D03", fzg:"NEF-RTW · K-ZUG · FISU · OA", text:"Bauwerkseinsturz"},
            {code:"22D04", fzg:"RTW · K-1 · FISU", text:"Raumenge – eingeschlossen"},
            {code:"22D05", fzg:"RTW · K-1 · FISU", text:"Unzugängliches Gelände"},
            {code:"22D06", fzg:"NEF-RTW · K-1 · FISU · OA", text:"Erdrutsch/Lawine"},
            {code:"22D00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"22B01", fzg:"NKT", text:"Nicht mehr eingeklemmt (unbekannte Verletzung)"},
            {code:"22B02", fzg:"RTW", text:"Nur periphere Einklemmung"},
            {code:"22B03", fzg:"RTW", text:"Unbekannter Zustand (Erkundung) / Andere Codes nicht zutreffend"},
            {code:"22B00", fzg:"RTW", text:"Aufwertung"},
            {code:"22A01", fzg:"KTW/KTW-K", text:"Nicht mehr eingeklemmt (keine Verletzung)"}
        ],
        "23": [
            {code:"23E01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand aufgrund von Narkotika/Opioiden (offensichtlich)"},
            {code:"23E00", fzg:"NEF-RTW · FISU", text:"Aufwertung"},
            {code:"23D01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"23D02", fzg:"RTW", text:"Bewusstlos"},
            {code:"23D03", fzg:"RTW", text:"Veränderte Hautfarbe"},
            {code:"23D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"23C01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"23C04", fzg:"RTW", text:"Kokain, Methamphetamine (oder Abkömmlinge)"},
            {code:"23C05", fzg:"RTW", text:"Narkotika/Opiate (Heroin, Morphin, Methadon, OxyContin usw.)"},
            {code:"23C06", fzg:"RTW", text:"Säuren oder Laugen"},
            {code:"23C07", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"23C08", fzg:"RTW", text:"Empfehlung der VIZ"},
            {code:"23C00", fzg:"RTW", text:"Aufwertung"},
            {code:"23B01", fzg:"RTW", text:"Überdosis (ohne Notfallleitsymptome)"},
            {code:"23B00", fzg:"RTW", text:"Aufwertung"},
            {code:"23O01", fzg:"TEWEB / NKT", text:"Vergiftung (ohne Notfallleitsymptome)"}
        ],
        "24": [
            {code:"24D01", fzg:"NEF-RTW", text:"Fehllage oder Nabelschnurvorfall"},
            {code:"24D02", fzg:"RTW", text:"Kopf sichtbar / geboren"},
            {code:"24D03", fzg:"RTW", text:"Unmittelbar bevorstehende Geburt (≥6 Monate/24 Wochen)"},
            {code:"24D04", fzg:"RTW", text:"Blutungen im 3. Trimester"},
            {code:"24D05", fzg:"RTW", text:"Erwartete Komplikationen"},
            {code:"24D06", fzg:"NEF-RTW", text:"Baby ist geboren (Komplikationen beim Baby)"},
            {code:"24D07", fzg:"NEF-RTW", text:"Baby ist geboren (Komplikationen bei der Mutter)"},
            {code:"24C02", fzg:"RTW", text:"Starke Blutung im 1. Trimester"},
            {code:"24C03", fzg:"RTW", text:"Bauchschmerzen/-krämpfe (<6 Monate/24 Wochen, kein Fötus/Gewebe)"},
            {code:"24C04", fzg:"RTW", text:"Baby ist geboren (keine Komplikationen)"},
            {code:"24C00", fzg:"RTW", text:"Aufwertung"},
            {code:"24B01", fzg:"KTW", text:"Wehen (keine unmittelbar bevorstehende Geburt, ≥6 Monate/24 Wochen)"},
            {code:"24B02", fzg:"KTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"24B00", fzg:"RTW", text:"Aufwertung"},
            {code:"24A01", fzg:"KTW", text:"Blutungen oder Fehlgeburt im 1. Trimester"},
            {code:"24A02", fzg:"KTW", text:"Situation mit einer bestätigten Totgeburt"}
        ],
        "25": [
            {code:"25D01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"25D02", fzg:"RTW", text:"Bewusstlos"},
            {code:"25D03", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"25D04", fzg:"RTW", text:"Gefährliche Blutung"},
            {code:"25D05", fzg:"RTW", text:"Beinahe-Erhängen/-Strangulierung/-Ersticken (wach mit Atembeschwerden)"},
            {code:"25D06", fzg:"NEF-RTW · FISU", text:"Gerade gesprungen"},
            {code:"25D00", fzg:"RTW", text:"Aufwertung"},
            {code:"25B03", fzg:"RTW", text:"Suizidankündigung"},
            {code:"25B04", fzg:"RTW · STEG", text:"Person droht zu springen"},
            {code:"25B05", fzg:"NKT", text:"Beinahe-Erhängen/-Strangulierung/-Ersticken (wach ohne Atembeschwerden)"},
            {code:"25B06", fzg:"NKT", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"25B00", fzg:"RTW", text:"Aufwertung"},
            {code:"25A01", fzg:"KTW/KTW-K", text:"Nicht suizidgefährdet und wach"},
            {code:"25A02", fzg:"KTW/KTW-K", text:"Suizidgefährdet (nicht drohend) und wach"}
        ],
        "26": [
            {code:"26D01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"26D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"26C01", fzg:"RTW", text:"Veränderte Bewusstseinslage"},
            {code:"26C02", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"26C03", fzg:"KTW", text:"Sichelzellenanämie/Thalassämie"},
            {code:"26C04", fzg:"KTW", text:"Autonome Dysreflexie/Hyperreflexie"},
            {code:"26C00", fzg:"RTW", text:"Aufwertung"},
            {code:"26A01", fzg:"TEWEB", text:"Keine Notfallleitsymptome"},
            {code:"26A02", fzg:"1450/KTW-K", text:"Blutdruckprobleme (ohne Symptome)"},
            {code:"26A03", fzg:"1450/KTW-K", text:"Schwindel/Drehschwindel"},
            {code:"26A04", fzg:"1450/KTW-K", text:"Fieber/Schüttelfrost"},
            {code:"26A05", fzg:"1450/KTW-K", text:"Reduzierter Allgemeinzustand"},
            {code:"26A06", fzg:"TEWEB", text:"Übelkeit"},
            {code:"26A07", fzg:"1450/KTW-K", text:"Akute Unbeweglichkeit (Schwäche)"},
            {code:"26A09", fzg:"KTW/KTW-K", text:"Nur Transportanforderung"},
            {code:"26A10", fzg:"1450/KTW-K", text:"Schlecht/Krank"},
            {code:"26A11", fzg:"1450/KTW-K", text:"Erbrechen"},
            {code:"26A12", fzg:"NKT", text:"Verdacht auf Meningitis"},
            {code:"26A00", fzg:"TEWEB", text:"Aufwertung"}
        ],
        "27": [
            {code:"27D01", fzg:"NEF-RTW · AED · FISU · OA", text:"Kreislaufstillstand"},
            {code:"27D02", fzg:"NEF-RTW · FISU · OA", text:"Bewusstlos"},
            {code:"27D03", fzg:"NEF-RTW · FISU · OA", text:"Bewusstseinstrübung"},
            {code:"27D04", fzg:"NEF-RTW · FISU · OA", text:"Zentrale Wunden"},
            {code:"27D05", fzg:"RTW · FISU", text:"Mehrere Wunden"},
            {code:"27D06", fzg:"RTW · K-1 · FISU · 2.RTW · OA", text:"Mehrere Verletzte"},
            {code:"27D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"27B01", fzg:"RTW", text:"Einzelne ältere (≥6h) zentrale Wunde"},
            {code:"27B02", fzg:"RTW", text:"Einzelne bekannte periphere Wunde"},
            {code:"27B03", fzg:"RTW", text:"Starke Blutung"},
            {code:"27B04", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"27B05", fzg:"NEF", text:"Offensichtlich tote Person"},
            {code:"27B00", fzg:"RTW", text:"Aufwertung"},
            {code:"27A01", fzg:"KTW/KTW-K", text:"Ältere (≥6h) periphere Wunde (ohne Notfallleitsymptome)"}
        ],
        "28": [
            {code:"28C01", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"28C02", fzg:"RTW", text:"Abnorme Atmung"},
            {code:"28C03", fzg:"RTW", text:"Plötzliche Sprachstörungen"},
            {code:"28C04", fzg:"RTW", text:"Plötzlich aufgetretene Schwäche oder Taubheitsgefühl (einseitig)"},
            {code:"28C05", fzg:"RTW", text:"Plötzliche Lähmungserscheinungen oder hängende Gesichtshälfte (einseitig)"},
            {code:"28C06", fzg:"RTW", text:"Plötzlicher Verlust des Gleichgewichts oder der Koordination"},
            {code:"28C07", fzg:"RTW", text:"Plötzliche Sehstörungen"},
            {code:"28C08", fzg:"RTW", text:"Plötzlicher Beginn starker Kopfschmerzen"},
            {code:"28C09", fzg:"RTW", text:"Schlaganfall-Vorgeschichte"},
            {code:"28C10", fzg:"RTW", text:"TIA- (Mini-Schlaganfall-) Vorgeschichte"},
            {code:"28C11", fzg:"RTW", text:"Normale Atmung ≥35"},
            {code:"28C12", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"28C00", fzg:"RTW", text:"Aufwertung"},
            {code:"28A01", fzg:"NKT", text:"Normale Atmung <35"}
        ],
        "29": [
            {code:"29D01", fzg:"K-ZUG · RTW · FISU · OA", text:"Größeres Ereignis"},
            {code:"29D02", fzg:"NEF-RTW · K-1 · FISU", text:"Gefährlicher Unfallmechanismus"},
            {code:"29D03", fzg:"RTW · FISU", text:"Aufprall mit hoher Geschwindigkeit"},
            {code:"29D04", fzg:"NEF-RTW · K-1 · FISU · ABC · OA", text:"Gefahrgut"},
            {code:"29D05", fzg:"NEF-RTW · FISU", text:"Eingeklemmte Person"},
            {code:"29D06", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"29D07", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"29D09", fzg:"RTW · FISU", text:"Bewusstseinstrübung mit normaler Atmung"},
            {code:"29D00", fzg:"NEF-RTW · 2.RTW", text:"Aufwertung"},
            {code:"29B01", fzg:"RTW", text:"Verletzungen"},
            {code:"29B02", fzg:"NKT", text:"Starke Blutung"},
            {code:"29B03", fzg:"RTW", text:"Andere Gefahren"},
            {code:"29B04", fzg:"RTW", text:"Geringer Unfallmechanismus (Anrufer 1. oder 2. Hand)"},
            {code:"29B05", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"29B00", fzg:"RTW", text:"Aufwertung"},
            {code:"29A01", fzg:"NKT", text:"Anrufer 1. Hand mit Verletzungen in ungefährlicher Körperregion"},
            {code:"29A02", fzg:"KTW · 2KTW", text:"Keine Verletzten gemeldet (unbestätigt oder ≥5 Personen beteiligt)"},
            {code:"29O01", fzg:"KTW", text:"Keine Verletzungen (bestätigt, bis zu 4 Personen)"},
            {code:"KZUG_29D01", fzg:"K-ZUG · RTW · FISU · OA", text:"Verkehrsunfall – Größeres Ereignis"}
        ],
        "30": [
            {code:"30D01", fzg:"NEF-RTW · AED · FISU", text:"Kreislaufstillstand"},
            {code:"30D02", fzg:"NEF-RTW · FISU", text:"Bewusstlos"},
            {code:"30D03", fzg:"RTW", text:"Bewusstseinstrübung"},
            {code:"30D04", fzg:"RTW · FISU", text:"Verletzungen im Brust- oder Halsbereich (mit Atembeschwerden)"},
            {code:"30D05", fzg:"RTW · FISU", text:"Aufprall mit hoher Geschwindigkeit / Massive Krafteinwirkung"},
            {code:"30D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"30B01", fzg:"RTW", text:"Möglicherweise gefährliche Körperregion"},
            {code:"30B02", fzg:"RTW", text:"Starke Blutung"},
            {code:"30B03", fzg:"RTW", text:"Unbekannte Körperregion (Anrufer nicht bei Patient)"},
            {code:"30B00", fzg:"RTW", text:"Aufwertung"},
            {code:"30A01", fzg:"NKT", text:"Ungefährliche Körperregion mit Fehlstellung"},
            {code:"30A02", fzg:"KTW/KTW-K", text:"Ungefährliche Körperregion"},
            {code:"30A03", fzg:"KTW/KTW-K", text:"Ältere (≥6h) Verletzung (ohne Notfallleitsymptome)"}
        ],
        "31": [
            {code:"31E01", fzg:"NEF-RTW · AED · FISU", text:"Ineffektive Atmung"},
            {code:"31E00", fzg:"NEF-RTW · AED · FISU", text:"Aufwertung"},
            {code:"31D01", fzg:"NEF-RTW · AED · FISU", text:"Bewusstlosigkeit – Agonal"},
            {code:"31C02", fzg:"RTW", text:"Ohnmachtsanfall/-anfälle, ansprechbar ≥35 (mit bekanntem Herzleiden)"},
            {code:"31C03", fzg:"RTW", text:"Frauen 12–50 mit Bauchschmerzen"},
            {code:"31C00", fzg:"RTW", text:"Aufwertung"},
            {code:"31A01", fzg:"KTW", text:"Ohnmachtsanfall/-anfälle, ansprechbar ≥35 (ohne bekanntes Herzleiden)"},
            {code:"31A02", fzg:"NKT", text:"Ohnmachtsanfall/-anfälle, ansprechbar <35 (mit bekanntem Herzleiden)"},
            {code:"31A03", fzg:"TEWEB · KTW-K", text:"Ohnmachtsanfall/-anfälle, ansprechbar <35 (ohne bekanntes Herzleiden)"}
        ],
        "32": [
            {code:"32D01", fzg:"NEF-RTW · FISU", text:"Fragliche Lebensbedrohung"},
            {code:"32D00", fzg:"NEF-RTW", text:"Aufwertung"},
            {code:"32B01", fzg:"RTW", text:"Stehen, sitzen, sich bewegen oder sprechen"},
            {code:"32B02", fzg:"RTW", text:"Medizinische Notfallmeldung durch Notrufsystem (keine Patienteninformation)"},
            {code:"32B03", fzg:"RTW", text:"Unbekannter Zustand / Andere Codes nicht zutreffend"},
            {code:"32B04", fzg:"RTW", text:"Fremdsprachiger Anrufer nicht verstanden (kein Dolmetscher in der Leitstelle)"}
        ],
        "37": [
            {code:"37D03", fzg:"NEF-AIT · AIT-NEF · BIT", text:"Transfer NEF-RTW – dringend (MCI, PTCA, STEMI ACS, akute Blutung...)"},
            {code:"37D05", fzg:"NEF-AIT · AIT-NEF · BIT", text:"Transfer NEF-RTW – Notarztbegleitung erforderlich"},
            {code:"37C07", fzg:"AIT · NEF", text:"Transfer RTW"},
            {code:"37C08", fzg:"NEF-BIT / BIT", text:"Transfer BIT"},
            {code:"37C09", fzg:"NAH", text:"Transfer NAH"},
            {code:"37B02", fzg:"AIT", text:"Transfer Neugeborene"},
            {code:"37A02", fzg:"KTW", text:"Transfer KTW"}
        ],
        "42": [
            {code:"42D01", fzg:"NEF · FISU", text:"Patient in Lebensgefahr/kritisch"},
            {code:"42C01", fzg:"NEF", text:"Notarztintervention erforderlich"},
            {code:"42C02", fzg:"NAH", text:"NAH-Anforderung Wien"},
            {code:"42C03", fzg:"NAH", text:"NAH-Anforderung anderes Bundesland"},
            {code:"42B01", fzg:"RTW", text:"RTW-Nachforderung durch Notarzt"},
            {code:"42B02", fzg:"BIT", text:"BIT-Nachforderung (durch Fzg bei Primäreinsätzen)"},
            {code:"42B03", fzg:"RTW", text:"STEG-Nachforderung"},
            {code:"42B04", fzg:"RTW", text:"ABC-Nachforderung"},
            {code:"42B05", fzg:"KA", text:"HIO-Nachforderung"},
            {code:"42A01", fzg:"KTW", text:"KTW-Nachforderung durch Notarzt"},
            {code:"42A02", fzg:"KTW/RTW", text:"KTW/RTW fordert weiteres Fahrzeug an"}
        ],
        "DF": [
            {code:"DF-Menage", fzg:"", text:"Dienstfahrt Essen holen"},
            {code:"DF-Reinigen", fzg:"", text:"Dienstfahrt Fahrzeugreinigung"},
            {code:"DF-Sonstige", fzg:"", text:"Dienstfahrt Sonstige"},
            {code:"DF-Station", fzg:"", text:"Dienstfahrt Station"},
            {code:"DF-Tanken", fzg:"", text:"Dienstfahrt Tanken"},
            {code:"DF-Werkstatt", fzg:"", text:"Dienstfahrt Werkstatt"},
            {code:"DF-Zentrale", fzg:"", text:"Dienstfahrt Zentrale"}
        ]
    };

    function renderAaoList(kat, filter) {
        const box = document.getElementById('einsatz-ergebnis');
        if (!box) return;
        const list = aaoData[kat] || [];
        const q = (filter || '').toLowerCase().trim();
        const filtered = list.filter(item =>
            !q || item.code.toLowerCase().includes(q) || item.text.toLowerCase().includes(q) || item.fzg.toLowerCase().includes(q)
        );
        if (!kat || filtered.length === 0) {
            box.style.display = 'none';
            box.innerHTML = '';
            return;
        }
        box.style.display = 'block';
        box.innerHTML = filtered.map(item => `
            <div class="aao-row" data-code="${item.code}" style="display:flex;gap:1rem;padding:0.45rem 0.6rem;border-bottom:1px solid #f1f5f9;cursor:pointer;font-size:0.92rem;">
                <span style="color:#16a34a;font-weight:600;min-width:4.5rem;">${item.code}</span>
                <span style="min-width:9rem;color:#374151;">${item.fzg}</span>
                <span>${item.text}</span>
            </div>
        `).join('');
        box.querySelectorAll('.aao-row').forEach(row => {
            row.addEventListener('click', () => {
                const code = row.dataset.code;
                const fzg = row.children[1]?.textContent || '';
                const desc = row.children[2]?.textContent || '';
                document.getElementById('einsatz-code').value = code;
                const sel = document.getElementById('einsatz-selected');
                const selText = document.getElementById('einsatz-selected-text');
                if (sel && selText) {
                    sel.style.display = 'block';
                    selText.textContent = code + ' · ' + fzg + ' · ' + desc;
                }
                box.querySelectorAll('.aao-row').forEach(r => r.style.background = '');
                row.style.background = '#ecfdf5';
            });
        });
    }

    document.getElementById('einsatz-kat')?.addEventListener('change', (e) => {
        const sel = document.getElementById('einsatz-selected');
        if (sel) sel.style.display = 'none';
        document.getElementById('einsatz-code').value = '';
        renderAaoList(e.target.value, document.getElementById('einsatz-suche')?.value || '');
    });
    document.getElementById('einsatz-suche')?.addEventListener('input', (e) => {
        const kat = document.getElementById('einsatz-kat')?.value || '';
        renderAaoList(kat, e.target.value);
    });

;

    renderEinsatz();
    updateAkhDisplay();



    // Einsatznachbesprechung
    let nachbesprechungen = JSON.parse(localStorage.getItem('brw_nach') || '[]');
    function saveNach() { localStorage.setItem('brw_nach', JSON.stringify(nachbesprechungen)); }
    function renderNach() {
        const list = document.getElementById('nach-list');
        const count = document.getElementById('nach-count');
        if (!list) return;
        if (count) count.textContent = nachbesprechungen.length;
        if (nachbesprechungen.length === 0) {
            list.innerHTML = '<p class="mb-empty">Noch keine Nachbesprechungen.</p>';
            return;
        }
        list.innerHTML = nachbesprechungen.map(n => `
            <div class="rueck-item" style="cursor:pointer;" onclick="this.nextElementSibling?.classList.toggle('hidden')">
                <strong>${n.datum} – ${n.einsatz}</strong>
                <span>Klicken zum Anzeigen</span>
            </div>
            <div class="hidden" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0.75rem;margin:-0.5rem 0 0.5rem;font-size:0.85rem;">
                <strong>Was lief gut:</strong><br>${n.gut || '–'}<br><br>
                <strong>Was lief nicht gut:</strong><br>${n.nichtgut || '–'}<br><br>
                <strong>Verbesserungen / Maßnahmen:</strong><br>${n.verbesserungen || '–'}
            </div>
        `).join('');
    }
    document.getElementById('nach-save')?.addEventListener('click', () => {
        const einsatz = document.getElementById('nach-einsatz')?.value?.trim();
        if (!einsatz) { alert('Bitte Einsatz angeben.'); return; }
        nachbesprechungen.unshift({
            id: Date.now(),
            datum: new Date().toLocaleDateString('de-AT'),
            einsatz,
            gut: document.getElementById('nach-gut')?.value || '',
            nichtgut: document.getElementById('nach-nichtgut')?.value || '',
            verbesserungen: document.getElementById('nach-verbesserungen')?.value || ''
        });
        saveNach();
        renderNach();
        document.getElementById('nach-einsatz').value = '';
        document.getElementById('nach-gut').value = '';
        document.getElementById('nach-nichtgut').value = '';
        document.getElementById('nach-verbesserungen').value = '';
    });
    renderNach();


    // Rettungsakademie tabs
    document.querySelectorAll('[data-akademie]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-akademie]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.akademie;
            ['uebersicht','kurse','anfragen','verlauf','medea'].forEach(t => {
                const el = document.getElementById('akademie-' + t);
                if (el) el.style.display = t === tab ? 'block' : 'none';
            });
        });
    });


    // Ausbildungsanfragen
    let anfragen = JSON.parse(localStorage.getItem('brw_anfragen') || '[]');
    function saveAnfragen() { localStorage.setItem('brw_anfragen', JSON.stringify(anfragen)); }
    function renderAnfragen() {
        const list = document.getElementById('anfrage-list');
        if (!list) return;
        if (anfragen.length === 0) {
            list.innerHTML = '<p class="mb-empty">Noch keine Anfragen.</p>';
            return;
        }
        list.innerHTML = anfragen.map(a => `
            <div class="rueck-item">
                <strong>${a.datum} – ${a.kurs !== '— anderer Kurs / Aufstieg (unten angeben) —' ? a.kurs : a.ziel}</strong>
                <span>${a.begruendung || '–'}</span>
            </div>
        `).join('');
    }
    document.getElementById('anfrage-save')?.addEventListener('click', () => {
        const kurs = document.getElementById('anfrage-kurs')?.value || '';
        const ziel = document.getElementById('anfrage-ziel')?.value?.trim() || '';
        if (kurs.startsWith('—') && !ziel) { alert('Bitte Ziel angeben.'); return; }
        anfragen.unshift({
            id: Date.now(),
            datum: new Date().toLocaleDateString('de-AT'),
            kurs, ziel,
            begruendung: document.getElementById('anfrage-begruendung')?.value || ''
        });
        saveAnfragen();
        renderAnfragen();
        document.getElementById('anfrage-ziel').value = '';
        document.getElementById('anfrage-begruendung').value = '';
    });
    renderAnfragen();


    // Schadensmeldungen
    let schadenList = JSON.parse(localStorage.getItem('brw_schaden') || '[]');
    function saveSchaden() { localStorage.setItem('brw_schaden', JSON.stringify(schadenList)); }
    function renderSchaden() {
        const list = document.getElementById('schaden-list');
        const count = document.getElementById('schaden-count');
        if (!list) return;
        if (count) count.textContent = schadenList.length + ' Meldungen';
        if (schadenList.length === 0) {
            list.innerHTML = '<tr><td colspan="4" class="mb-empty">Keine Meldungen.</td></tr>';
            return;
        }
        list.innerHTML = schadenList.map(s => `
            <tr>
                <td>${s.melder}</td>
                <td>${s.fahrzeug}</td>
                <td>${s.beschreibung}</td>
                <td style="color:#059669;">${s.status}</td>
            </tr>
        `).join('');
    }
    document.getElementById('schaden-new')?.addEventListener('click', () => {
        const form = document.getElementById('schaden-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('schaden-save')?.addEventListener('click', () => {
        const fahrzeug = document.getElementById('schaden-fahrzeug')?.value?.trim();
        const beschreibung = document.getElementById('schaden-beschreibung')?.value?.trim();
        if (!fahrzeug || !beschreibung) { alert('Bitte Fahrzeug und Beschreibung angeben.'); return; }
        schadenList.unshift({
            id: Date.now(),
            melder: 'Ralf Tieber',
            fahrzeug, beschreibung,
            status: 'Offen',
            datum: new Date().toLocaleDateString('de-AT')
        });
        saveSchaden();
        renderSchaden();
        document.getElementById('schaden-fahrzeug').value = '';
        document.getElementById('schaden-beschreibung').value = '';
        document.getElementById('schaden-form').style.display = 'none';
    });
    renderSchaden();


    // Anträge
    let antraegeList = JSON.parse(localStorage.getItem('brw_antraege') || '[]');
    function saveAntraege() { localStorage.setItem('brw_antraege', JSON.stringify(antraegeList)); }
    function renderAntraege() {
        const list = document.getElementById('antraege-list');
        const count = document.getElementById('antraege-count');
        if (!list) return;
        if (count) count.textContent = antraegeList.length + ' Anträge';
        if (antraegeList.length === 0) {
            list.innerHTML = '<tr><td colspan="3" class="mb-empty">Keine Anträge.</td></tr>';
            return;
        }
        list.innerHTML = antraegeList.map(a => `
            <tr>
                <td>${a.steller}</td>
                <td>${a.betreff}<br><span style="font-size:0.75rem;color:#6b7280;">${a.details}</span></td>
                <td style="color:#059669;">${a.status}</td>
            </tr>
        `).join('');
    }
    document.getElementById('antrag-new')?.addEventListener('click', () => {
        const form = document.getElementById('antrag-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('antrag-save')?.addEventListener('click', () => {
        const betreff = document.getElementById('antrag-betreff')?.value?.trim();
        const details = document.getElementById('antrag-details')?.value?.trim();
        if (!betreff || !details) { alert('Bitte Betreff und Details angeben.'); return; }
        antraegeList.unshift({
            id: Date.now(),
            steller: 'Ralf Tieber',
            betreff, details,
            status: 'Offen',
            datum: new Date().toLocaleDateString('de-AT')
        });
        saveAntraege();
        renderAntraege();
        document.getElementById('antrag-betreff').value = '';
        document.getElementById('antrag-details').value = '';
        document.getElementById('antrag-form').style.display = 'none';
    });
    renderAntraege();


    // Rettungsdirektion Anfragen - collects all requests
    function getAllAnfragen() {
        const all = [];
        // Urlaub
        (JSON.parse(localStorage.getItem('brw_urlaub') || '[]')).forEach(u => {
            all.push({ id: u.id, typ: 'Urlaub', steller: 'Ralf Tieber', details: u.von + ' - ' + u.bis, status: u.status || 'Offen', source: 'urlaub' });
        });
        // Nebenbeschäftigung
        (JSON.parse(localStorage.getItem('brw_neben') || '[]')).forEach(n => {
            all.push({ id: n.id, typ: 'Nebenbeschäftigung', steller: 'Ralf Tieber', details: n.art || '', status: n.status || 'Offen', source: 'neben' });
        });
        // Feedback
        (JSON.parse(localStorage.getItem('brw_feedback') || '[]')).forEach(f => {
            all.push({ id: f.id, typ: 'Feedback', steller: 'Ralf Tieber', details: f.art + ': ' + (f.text || '').substring(0, 50), status: f.status || 'Offen', source: 'feedback' });
        });
        // Schaden
        (JSON.parse(localStorage.getItem('brw_schaden') || '[]')).forEach(s => {
            all.push({ id: s.id, typ: 'Schadensmeldung', steller: s.melder || 'Ralf Tieber', details: s.fahrzeug + ': ' + (s.beschreibung || '').substring(0, 40), status: s.status || 'Offen', source: 'schaden' });
        });
        // Anträge
        (JSON.parse(localStorage.getItem('brw_antraege') || '[]')).forEach(a => {
            all.push({ id: a.id, typ: 'Antrag', steller: a.steller || 'Ralf Tieber', details: a.betreff, status: a.status || 'Offen', source: 'antraege' });
        });
        return all;
    }
    function renderRdAnfragen() {
        const list = document.getElementById('rd-anfragen-list');
        const count = document.getElementById('rd-anfragen-count');
        if (!list) return;
        const all = getAllAnfragen();
        if (count) count.textContent = all.length + ' Anfragen';
        if (all.length === 0) {
            list.innerHTML = '<tr><td colspan="5" class="mb-empty">Keine Anfragen.</td></tr>';
            return;
        }
        list.innerHTML = all.map(a => `
            <tr>
                <td>${a.typ}</td>
                <td>${a.steller}</td>
                <td>${a.details}</td>
                <td style="color:${a.status === 'Genehmigt' ? '#059669' : a.status === 'Abgelehnt' ? '#dc2626' : '#6b7280'};">${a.status}</td>
                <td>
                    <select class="status-select" data-id="${a.id}" data-source="${a.source}">
                        <option value="Offen" ${a.status === 'Offen' ? 'selected' : ''}>Offen</option>
                        <option value="Genehmigt" ${a.status === 'Genehmigt' ? 'selected' : ''}>Genehmigt</option>
                        <option value="Abgelehnt" ${a.status === 'Abgelehnt' ? 'selected' : ''}>Abgelehnt</option>
                    </select>
                </td>
            </tr>
        `).join('');
        list.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', () => {
                const id = Number(sel.dataset.id);
                const source = sel.dataset.source;
                const status = sel.value;
                const key = 'brw_' + source;
                const items = JSON.parse(localStorage.getItem(key) || '[]');
                const item = items.find(i => i.id === id);
                if (item) { item.status = status; localStorage.setItem(key, JSON.stringify(items)); }
                renderRdAnfragen();
            });
        });
    }
    document.querySelector('[data-view="rd-anfragen"]')?.addEventListener('click', renderRdAnfragen);
    renderRdAnfragen();


    // Dienstplan tabs
    document.querySelectorAll('[data-dp]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-dp]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.dp;
            document.getElementById('dp-anstehend').style.display = tab === 'anstehend' ? 'block' : 'none';
            document.getElementById('dp-vergangen').style.display = tab === 'vergangen' ? 'block' : 'none';
        });
    });


    // Dienstplan Veranstaltungen
    let dpList = JSON.parse(localStorage.getItem('brw_dienstplan') || '[]');
    function saveDp() { localStorage.setItem('brw_dienstplan', JSON.stringify(dpList)); }
    function renderDp() {
        const list = document.getElementById('dp-list');
        if (!list) return;
        if (dpList.length === 0) {
            list.innerHTML = '<p class="mb-empty">Keine Veranstaltungen.</p>';
            return;
        }
        list.innerHTML = dpList.map(d => `
            <div class="rueck-item" style="margin-bottom:0.5rem;">
                <strong>${d.titel}</strong>
                <span>${d.zeit} · ${d.ort}</span>
                <span style="font-size:0.8rem;color:#6b7280;">${d.beschreibung}</span>
            </div>
        `).join('');
    }
    function checkDpPermission() {
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const createDiv = document.getElementById('dp-create');
        if (createDiv) createDiv.style.display = allowedRoles.includes(userRole) ? 'block' : 'none';
    }
    document.getElementById('dp-save')?.addEventListener('click', () => {
        const titel = document.getElementById('dp-titel')?.value?.trim();
        const zeit = document.getElementById('dp-zeit')?.value?.trim();
        const ort = document.getElementById('dp-ort')?.value?.trim();
        const beschreibung = document.getElementById('dp-beschreibung')?.value?.trim();
        if (!titel || !zeit) { alert('Bitte Titel und Zeit angeben.'); return; }
        dpList.unshift({ id: Date.now(), titel, zeit, ort, beschreibung });
        saveDp();
        renderDp();
        document.getElementById('dp-titel').value = '';
        document.getElementById('dp-zeit').value = '';
        document.getElementById('dp-ort').value = '';
        document.getElementById('dp-beschreibung').value = '';
    });
    document.querySelector('[data-view="dienstplan"]')?.addEventListener('click', checkDpPermission);
    renderDp();


    // Vorschriften erstellen
    let vorschriftList = JSON.parse(localStorage.getItem('brw_vorschriften') || '[]');
    function saveVorschriften() { localStorage.setItem('brw_vorschriften', JSON.stringify(vorschriftList)); }
    function checkVorschriftPermission() {
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const createDiv = document.getElementById('vorschrift-create');
        if (createDiv) createDiv.style.display = allowedRoles.includes(userRole) ? 'block' : 'none';
    }
    document.getElementById('vorschrift-save')?.addEventListener('click', () => {
        const titel = document.getElementById('vorschrift-titel')?.value?.trim();
        const art = document.getElementById('vorschrift-art')?.value;
        const sachgebiet = document.getElementById('vorschrift-sachgebiet')?.value;
        const text = document.getElementById('vorschrift-text')?.value?.trim();
        if (!titel) { alert('Bitte Titel angeben.'); return; }
        vorschriftList.unshift({ id: Date.now(), titel, art, sachgebiet, text });
        saveVorschriften();
        document.getElementById('vorschrift-titel').value = '';
        document.getElementById('vorschrift-text').value = '';
        alert('Vorschrift veröffentlicht.');
    });
    document.querySelector('[data-view="vorschriften"]')?.addEventListener('click', checkVorschriftPermission);


    // Einsatznachbesprechung
    document.getElementById('nach-new')?.addEventListener('click', () => {
        const form = document.getElementById('nach-form');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
    let nachList = JSON.parse(localStorage.getItem('brw_nachbesprechung') || '[]');
    function saveNach() { localStorage.setItem('brw_nachbesprechung', JSON.stringify(nachList)); }
    function renderNach() {
        const list = document.getElementById('nach-list');
        if (!list) return;
        if (nachList.length === 0) {
            list.innerHTML = '<p class="mb-empty">Noch keine Nachbesprechungen.</p>';
            return;
        }
        list.innerHTML = nachList.map(n => `
            <div class="rueck-item" style="margin-bottom:0.5rem;">
                <strong>${n.einsatz}</strong>
                <span>👍 ${n.gut}</span>
                <span>👎 ${n.nichtgut}</span>
                <span>💡 ${n.verbesserungen}</span>
            </div>
        `).join('');
    }
    document.getElementById('nach-save')?.addEventListener('click', () => {
        const einsatz = document.getElementById('nach-einsatz')?.value?.trim();
        const gut = document.getElementById('nach-gut')?.value?.trim();
        const nichtgut = document.getElementById('nach-nichtgut')?.value?.trim();
        const verbesserungen = document.getElementById('nach-verbesserungen')?.value?.trim();
        if (!einsatz) { alert('Bitte Einsatz angeben.'); return; }
        nachList.unshift({ id: Date.now(), einsatz, gut, nichtgut, verbesserungen });
        saveNach();
        renderNach();
        document.getElementById('nach-form').style.display = 'none';
        document.getElementById('nach-einsatz').value = '';
        document.getElementById('nach-gut').value = '';
        document.getElementById('nach-nichtgut').value = '';
        document.getElementById('nach-verbesserungen').value = '';
    });
    renderNach();


    // Kurse ausschreiben
    let kursList = JSON.parse(localStorage.getItem('brw_kurse') || '[]');
    window.benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
    function saveKurse() { localStorage.setItem('brw_kurse', JSON.stringify(kursList)); }
    function checkKursPermission() {
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const createDiv = document.getElementById('kurs-create');
        if (createDiv) createDiv.style.display = allowedRoles.includes(userRole) ? 'block' : 'none';
    }
    document.getElementById('kurs-fuer')?.addEventListener('change', (e) => {
        const mitgliederDiv = document.getElementById('kurs-mitglieder');
        if (mitgliederDiv) mitgliederDiv.style.display = e.target.value === 'einzelne' ? 'block' : 'none';
        if (e.target.value === 'einzelne') renderMitgliederList();
    });
    function renderMitgliederList() {
        const list = document.getElementById('kurs-mitglieder-list');
        if (!list) return;
        const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01' }, ...benutzerList];
        list.innerHTML = allUsers.map(u => `<label style="display:block;"><input type="checkbox" value="${u.name}"> ${u.name}</label>`).join('');
    }
    document.getElementById('kurs-save')?.addEventListener('click', () => {
        const titel = document.getElementById('kurs-titel')?.value?.trim();
        const fuer = document.getElementById('kurs-fuer')?.value;
        const beschreibung = document.getElementById('kurs-beschreibung')?.value?.trim();
        if (!titel) { alert('Bitte Titel angeben.'); return; }
        let mitglieder = [];
        if (fuer === 'einzelne') {
            document.querySelectorAll('#kurs-mitglieder-list input:checked').forEach(cb => mitglieder.push(cb.value));
        }
        kursList.unshift({ id: Date.now(), titel, fuer, mitglieder, beschreibung });
        saveKurse();
        document.getElementById('kurs-titel').value = '';
        document.getElementById('kurs-beschreibung').value = '';
        alert('Kurs veröffentlicht.');
    });
    document.querySelector('[data-view="akademie"]')?.addEventListener('click', checkKursPermission);


    // Neue Benutzer anlegen
    document.getElementById('neu-save')?.addEventListener('click', () => {
        const name = document.getElementById('neu-benutzer')?.value?.trim();
        const dnr = document.getElementById('neu-dienstnummer')?.value?.trim();
        const funktion = document.getElementById('neu-funktion')?.value;
        if (!name || !dnr) { alert('Bitte Name und Dienstnummer angeben.'); return; }
        window.benutzerList.push({ name, dnr, funktion });
        localStorage.setItem('brw_benutzer', JSON.stringify(window.benutzerList));
        // Add to kurs dropdown
        const kursFuer = document.getElementById('kurs-fuer');
        if (kursFuer) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            kursFuer.appendChild(opt);
        }
        document.getElementById('neu-benutzer').value = '';
        document.getElementById('neu-dienstnummer').value = '';
        alert('Benutzer angelegt: ' + name);
    });


    // Stellenausschreibungen
    let stelleList = JSON.parse(localStorage.getItem('brw_stellen') || '[]');
    function saveStellen() { localStorage.setItem('brw_stellen', JSON.stringify(stelleList)); }
    function renderStellen() {
        const list = document.getElementById('stelle-list');
        if (!list) return;
        if (stelleList.length === 0) {
            list.innerHTML = '<p class="mb-empty">Derzeit keine Ausschreibungen.</p>';
            return;
        }
        list.innerHTML = stelleList.map(s => `
            <div class="rueck-item" style="margin-bottom:0.5rem;">
                <strong>${s.titel}</strong>
                <span>${s.beschreibung}</span>
            </div>
        `).join('');
    }
    function checkStellePermission() {
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const createDiv = document.getElementById('stelle-create');
        if (createDiv) createDiv.style.display = allowedRoles.includes(userRole) ? 'block' : 'none';
    }
    document.getElementById('stelle-save')?.addEventListener('click', () => {
        const titel = document.getElementById('stelle-titel')?.value?.trim();
        const beschreibung = document.getElementById('stelle-beschreibung')?.value?.trim();
        if (!titel) { alert('Bitte Titel angeben.'); return; }
        stelleList.unshift({ id: Date.now(), titel, beschreibung });
        saveStellen();
        renderStellen();
        document.getElementById('stelle-titel').value = '';
        document.getElementById('stelle-beschreibung').value = '';
    });
    document.querySelector('[data-view="stellen"]')?.addEventListener('click', checkStellePermission);
    renderStellen();


    document.getElementById('bc-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        showView('uebersicht');
    });


    // Benutzerliste rendern
    function renderBenutzer() {
        const list = document.getElementById('benutzer-list');
        if (!list) return;
        const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: 'Techniker' }, ...(window.benutzerList || [])];
        if (allUsers.length === 0) {
            list.innerHTML = '<p class="mb-empty">Keine Benutzer angelegt.</p>';
            return;
        }
        list.innerHTML = allUsers.map((u, i) => `
            <div class="rueck-item" style="margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <strong>${u.name}</strong>
                    <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                </div>
                <div>
                    <select class="funktion-select" data-idx="${i}" style="margin-right:0.5rem;">
                        <option value="${u.funktion}" selected>${u.funktion}</option>
                        <option>Techniker</option>
                        <option>Rettungsdirektor</option>
                        <option>Vize Rettungsdirektor</option>
                        <option>Notfallsanitäter NFS</option>
                        <option>Rettungssanitäter RS</option>
                    </select>
                    <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                </div>
            </div>
        `).join('');
        list.querySelectorAll('.funktion-select').forEach(sel => {
            sel.addEventListener('change', () => {
                const idx = Number(sel.dataset.idx);
                if (idx === 0) return; // Can't change admin
                benutzerList[idx - 1].funktion = sel.value;
                localStorage.setItem('brw_benutzer', JSON.stringify(window.benutzerList));
            });
        });
        list.querySelectorAll('.del-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = Number(btn.dataset.idx);
                if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
                const user = benutzerList[idx - 1];
                benutzerList.splice(idx - 1, 1);
                localStorage.setItem('brw_benutzer', JSON.stringify(window.benutzerList));
                // Remove from kurse
                kursList = kursList.filter(k => !k.mitglieder?.includes(user.name));
                localStorage.setItem('brw_kurse', JSON.stringify(kursList));
                // Remove from kurs dropdown
                const kursFuer = document.getElementById('kurs-fuer');
                if (kursFuer) {
                    Array.from(kursFuer.options).forEach(opt => {
                        if (opt.value === user.name) opt.remove();
                    });
                }
                setTimeout(renderBenutzer, 100);
            });
        });
    }
    document.querySelector('[data-view="rd-benutzer"]')?.addEventListener('click', () => setTimeout(renderBenutzer, 50));
    setTimeout(renderBenutzer, 200);


    // Funktion ändern aktualisiert Sidebar
    document.getElementById('admin-funktion')?.addEventListener('change', (e) => {
        const newFunktion = e.target.value;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
    });

    // Funktion speichern
    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        // Update sidebar
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        // Update the text under the name
        const funktionSpan = document.querySelector('#benutzer-list span');
        if (funktionSpan) funktionSpan.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });
    // Load saved function on page load
    setTimeout(() => {
        const savedFunktion = localStorage.getItem('brw_admin_funktion');
        if (savedFunktion) {
            const sidebarRole = document.getElementById('sidebar-role');
            if (sidebarRole) sidebarRole.textContent = savedFunktion;
            const funktionSpan = document.querySelector('#benutzer-list span');
            if (funktionSpan) funktionSpan.textContent = 'ZTR-01 · ' + savedFunktion;
            const adminSelect = document.getElementById('admin-funktion');
            if (adminSelect) adminSelect.value = savedFunktion;
        }
    }, 100);

    // Populate kurs dropdown with all users
    function populateKursDropdown() {
        const kursFuer = document.getElementById('kurs-fuer');
        if (!kursFuer) return;
        const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
        const allUsers = ['Dr.med. Ralf Tieber', ...benutzerList.map(u => u.name)];
        // Keep only "Alle Mitglieder" and add users
        kursFuer.innerHTML = '<option value="alle">Alle Mitglieder</option>';
        allUsers.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            kursFuer.appendChild(opt);
        });
    }
    setTimeout(populateKursDropdown, 200);

    function updateMitarbeiterCount() {
        const count = 1 + (window.benutzerList?.length || 0);
        const el = document.getElementById('mitarbeiter-count');
        if (el) el.textContent = count;
    }
    setTimeout(updateMitarbeiterCount, 200);

    function checkCreatePermissions() {
        const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
        const userRole = document.getElementById('sidebar-role')?.textContent || '';
        const hasPermission = allowedRoles.includes(userRole);
        ['kurs-create', 'stelle-create', 'vorschrift-create', 'dp-create'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = hasPermission ? 'block' : 'none';
        });
    }
    setTimeout(checkCreatePermissions, 200);

    // Ensure save button works
    document.addEventListener('click', (e) => {
        if (e.target.id === 'save-funktion' || e.target.closest('#save-funktion')) {
            const newFunktion = document.getElementById('admin-funktion')?.value;
            if (!newFunktion) return;
            const sidebarRole = document.getElementById('sidebar-role');
            if (sidebarRole) sidebarRole.textContent = newFunktion;
            const funktionSpan = document.querySelector('#benutzer-list span');
            if (funktionSpan) funktionSpan.textContent = 'ZTR-01 · ' + newFunktion;
            localStorage.setItem('brw_admin_funktion', newFunktion);
            alert('Funktion gespeichert: ' + newFunktion);
        }
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
            list.querySelectorAll('.save-user-funktion').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.dataset.idx);
                    const sel = list.querySelector(`.user-funktion[data-idx="${idx}"]`);
                    if (sel) {
                        const newFunktion = sel.value;
                        if (idx === 0) {
                            const sidebarRole = document.getElementById('sidebar-role');
                            if (sidebarRole) sidebarRole.textContent = newFunktion;
                            localStorage.setItem('brw_admin_funktion', newFunktion);
                        }
                        alert('Funktion gespeichert: ' + newFunktion);
                    }
                });
            });
        }
    }, 200);

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
            list.querySelectorAll('.save-user-funktion').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.dataset.idx);
                    const sel = list.querySelector(`.user-funktion[data-idx="${idx}"]`);
                    if (sel) {
                        const newFunktion = sel.value;
                        if (idx === 0) {
                            const sidebarRole = document.getElementById('sidebar-role');
                            if (sidebarRole) sidebarRole.textContent = newFunktion;
                            localStorage.setItem('brw_admin_funktion', newFunktion);
                        }
                        alert('Funktion gespeichert: ' + newFunktion);
                    }
                });
            });
        }
    }, 200);

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                // Update the text in the list
                const row = sel.closest('div');
                if (row) {
                    const span = row.parentElement.querySelector('span');
                    if (span) {
                        const parts = span.textContent.split('·');
                        span.textContent = parts[0].trim() + ' · ' + newFunktion;
                    }
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
    });

    function updateMitarbeiterCount() {
        const count = 1 + (JSON.parse(localStorage.getItem('brw_benutzer') || '[]').length);
        const el = document.getElementById('mitarbeiter-count');
        if (el) el.textContent = count;
    }
    setTimeout(updateMitarbeiterCount, 200);

    // Delete user handler
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('del-user')) {
            const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
            const userRole = document.getElementById('sidebar-role')?.textContent || '';
            if (!allowedRoles.includes(userRole)) {
                alert('Keine Berechtigung zum Löschen.');
                return;
            }
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            if (idx > 0 && idx <= benutzerList.length) {
                benutzerList.splice(idx - 1, 1);
                localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
                alert('Benutzer gelöscht.');
                location.reload();
            } else {
                alert('Benutzer nicht gefunden.');
            }
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            benutzerList.splice(idx - 1, 1);
            localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
            alert('Benutzer gelöscht.');
            location.reload();
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    document.getElementById('save-funktion')?.addEventListener('click', () => {
        const newFunktion = document.getElementById('admin-funktion')?.value;
        if (!newFunktion) return;
        const sidebarRole = document.getElementById('sidebar-role');
        if (sidebarRole) sidebarRole.textContent = newFunktion;
        const funktionText = document.getElementById('admin-funktion-text');
        if (funktionText) funktionText.textContent = 'ZTR-01 · ' + newFunktion;
        localStorage.setItem('brw_admin_funktion', newFunktion);
        alert('Funktion gespeichert: ' + newFunktion);
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            benutzerList.splice(idx - 1, 1);
            localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
            alert('Benutzer gelöscht.');
            location.reload();
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            benutzerList.splice(idx - 1, 1);
            localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
            alert('Benutzer gelöscht.');
            location.reload();
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            benutzerList.splice(idx - 1, 1);
            localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
            alert('Benutzer gelöscht.');
            location.reload();
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            benutzerList.splice(idx - 1, 1);
            localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
            alert('Benutzer gelöscht.');
            location.reload();
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            benutzerList.splice(idx - 1, 1);
            localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
            alert('Benutzer gelöscht.');
            location.reload();
        }
    });

    // Render user list on page load
    setTimeout(() => {
        const list = document.getElementById('benutzer-list');
        if (list) {
            const funktionen = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer', 'FISU', 'Praxisanleiter', 'Oberarzt OA', 'Hauptrettungsrat', 'Oberrettungsrat', 'Rettungsrat', 'Hauptrettungskommissar', 'Oberrettungskommissar', 'Rettungskommissar', 'Vize Rettungskommissär', '1. Offiziersstellvertreter', 'Offizierstellvertreter', 'Hauptsanitätsmeister', 'Obersanitätsmeister', 'Sanitätsmeister', 'Notarzt NA', 'Notfallsanitäter NKI', 'Notfallsanitäter NKV', 'Notfallsanitäter NKA', 'Notfallsanitäter NFS', 'Notfallsanitäter NFS i.A', 'NFS i.A', 'Rettungssanitäter RS', 'RS i.A'];
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            const allUsers = [{ name: 'Dr.med. Ralf Tieber', dnr: 'ZTR-01', funktion: localStorage.getItem('brw_admin_funktion') || 'Techniker' }, ...benutzerList];
            list.innerHTML = allUsers.map((u, i) => `
                <div style="margin-bottom:0.5rem;padding:0.5rem;background:#f9fafb;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${u.name}</strong>
                        <span style="color:#6b7280;">${u.dnr} · ${u.funktion}</span>
                    </div>
                    <div>
                        <select class="user-funktion" data-idx="${i}" style="margin-right:0.5rem;">
                            ${funktionen.map(f => `<option ${f === u.funktion ? 'selected' : ''}>${f}</option>`).join('')}
                        </select>
                        <button class="save-user-funktion" data-idx="${i}" style="background:#16a34a;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;margin-right:0.5rem;">Speichern</button>
                        <button class="del-user" data-idx="${i}" style="background:#dc2626;color:#fff;border:none;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;">Löschen</button>
                    </div>
                </div>
            `).join('');
        }
    }, 200);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-user-funktion')) {
            const idx = Number(e.target.dataset.idx);
            const sel = document.querySelector(`.user-funktion[data-idx="${idx}"]`);
            if (sel) {
                const newFunktion = sel.value;
                if (idx === 0) {
                    const sidebarRole = document.getElementById('sidebar-role');
                    if (sidebarRole) sidebarRole.textContent = newFunktion;
                    localStorage.setItem('brw_admin_funktion', newFunktion);
                }
                // Update the text in the list
                const row = sel.closest('div');
                if (row) {
                    const span = row.parentElement.querySelector('span');
                    if (span) {
                        const parts = span.textContent.split('·');
                        span.textContent = parts[0].trim() + ' · ' + newFunktion;
                    }
                }
                alert('Funktion gespeichert: ' + newFunktion);
            }
        }
        if (e.target.classList.contains('del-user')) {
            const allowedRoles = ['Techniker', 'Rettungsdirektor', 'Vize Rettungsdirektor', 'Chefarzt', 'Rettungsdienstleiter', 'Stv. Rettungsdienstleiter', 'Stabsstellenleiter', 'HIO - Hauptinspektionsoffizier', 'Zugskommandant', 'Gruppenkommandant', 'Leiter Rettungsakademie', 'Stv. L. Rettungsakademie', 'RAK Lehrer'];
            const userRole = document.getElementById('sidebar-role')?.textContent || '';
            if (!allowedRoles.includes(userRole)) {
                alert('Keine Berechtigung zum Löschen.');
                return;
            }
            const idx = Number(e.target.dataset.idx);
            if (idx === 0) { alert('Admin kann nicht gelöscht werden.'); return; }
            const benutzerList = JSON.parse(localStorage.getItem('brw_benutzer') || '[]');
            if (idx > 0 && idx <= benutzerList.length) {
                benutzerList.splice(idx - 1, 1);
                localStorage.setItem('brw_benutzer', JSON.stringify(benutzerList));
                alert('Benutzer gelöscht.');
                location.reload();
            } else {
                alert('Benutzer nicht gefunden.');
            }
        }
    });

    logoutBtn.addEventListener('click', () => {
        app.style.display = 'none';
        app.hidden = true;
        loginScreen.style.display = 'flex';
    });
});
