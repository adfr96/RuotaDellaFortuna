# 🎮 Ruota della Fortuna

Un'implementazione moderna e interattiva del gioco TV "Ruota della Fortuna". Scopri le lettere una per una o prova ad indovinare l'intera parola!

## 📋 Sommario

- [Caratteristiche](#caratteristiche)
- [Struttura del Progetto](#struttura-del-progetto)
- [Come Usare](#come-usare)
- [Gestione delle Frasi](#gestione-delle-frasi)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)

## ✨ Caratteristiche

### Gameplay
- 🎯 **Scopri lettere singole** - Premi un tasto per scoprire tutte le occorrenze di quella lettera
- 🎲 **Indovina la parola intera** - Usa il form apposito per tentare di indovinare l'intera frase
- 🎊 **Effetti visivi** - Animazioni fluide al flip delle lettere e coriandoli alla vittoria
- 🏆 **Controllo vittoria automatico** - Il gioco rileva quando hai completato la frase

### Interfaccia
- 📺 **Tabellone elegante** - Stile "Game Show" con celle luminose e glow effects
- 🎨 **Design moderno** - Gradenti azzurri, ombre, animazioni smooth
- 📱 **Responsive** - Adattati a smartphone, tablet e desktop
- 🌈 **Tema scuro** - Interface accattivante e facile per gli occhi

### Frasi
- 📝 **Gestione frasi** - Array JavaScript per un caricamento istantaneo
- 🏷️ **Categorie** - Ogni frase ha un tema per dare contesto
- 🔒 **Frasi nascoste** - Solo il tema è visibile, la soluzione resta segreta
- ⚡ **Aggiornamento rapido** - Modifica il file `phrases.js` e ricarica

## 🏗️ Struttura del Progetto

```
Ruota-Della-Fortuna/
├── index.html              # File principale HTML
├── README.md               # Documentazione
│
├── css/
│   ├── bootstrap.min.css   # Framework Bootstrap
│   ├── bootstrap-responsive.min.css
│   └── main.css            # Stili personalizzati
│
├── js/
│   ├── phrases.js          # ⭐ ARRAY DELLE FRASI (modifica qui!)
│   ├── main.js             # Logica del gioco
│   └── vendor/
│       ├── jquery-1.9.0.min.js
│       ├── bootstrap.min.js
│       └── html5-3.6-respond-1.1.0.min.js
│
├── img/                    # Cartella per immagini
└── phrases.json            # (deprecato - non più usato)
```

## 📖 Come Usare

### Avvio del Gioco

Semplicemente **apri il file `index.html` nel tuo browser**:

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

Oppure:
- Fai doppio clic su `index.html` nel file manager
- Clicca con tasto destro → "Apri con Browser"
- Trascina il file nel browser

### Durante il Gioco

1. **Clicca su un tema** nella lista in basso per iniziare
   - Il tabellone appare con la frase nascosta
   - Il tema selezionato si mostra nel box azzurro

2. **Scopri lettere** - Premi un tasto per scoprire tutte le occorrenze
   - Solo lettere (A-Z, caratteri accentati: À, È, é, ò, ù)
   - Non puoi ripetere la stessa lettera due volte
   - Mentre digiti nel form di indovinazione, il tabellone è disabilitato

3. **Indovina la frase intera** - Usa il form in alto
   - Digita la frase completa
   - Se corretta: tutte le lettere si rivelano + coriandoli celebrativi! 🎊
   - Se sbagliata: il form diventa rosso e puoi riprovare

4. **Nuova partita** - Clicca "Nuova Frase" per:
   - Scegliere un tema diverso oppure
   - Inserire una frase completamente nuova (con tema personalizzato)

## 📝 Gestione delle Frasi

### Dove sono le frasi?

Le frasi sono nel file **`js/phrases.js`**:

```javascript
const PHRASES = [
  {
    "frase": "LA RUOTA DELLA FORTUNA",
    "tema": "Game Show"
  },
  {
    "frase": "Ale è un programmatore java",
    "tema": "adfr96"
  },
  // ... altre frasi
];
```

### Come aggiungere una frase

1. Apri `js/phrases.js`
2. Aggiungi un nuovo oggetto nell'array:

```javascript
{
  "frase": "TUA FRASE QUI",
  "tema": "La tua categoria"
}
```

3. Salva il file
4. Ricarica il browser - la nuova frase apparirà nella lista di temi!

### Note importanti

- ✅ **Case-insensitive** - Maiuscole e minuscole sono trattate allo stesso modo
- ✅ **Caratteri speciali** - Apostrofi e caratteri speciali vengono rimossi automaticamente
- ✅ **Caratteri accentati** - À, È, é, ò, ù sono supportati
- ✅ **Spazi** - Gli spazi separano le parole visivamente sul tabellone

## 🎨 Struttura HTML Principale

```html
<!-- Tabellone principale -->
<div class="hero-unit tabbellone"></div>

<!-- Display del tema corrente -->
<div class="theme-display">
  <span class="theme-label">TEMA: </span>
  <span class="theme-value">-</span>
</div>

<!-- Statistiche gioco e form di indovinazione -->
<div class="hero-unit">
  <span class="game">N Partita</span>
  <span class="char-used">Lettere giocate: ...</span>
  <div class="guess-section">
    <input class="guess-input" placeholder="Indovina la parola intera...">
    <button class="btn btn-primary guess-btn">Indovina!</button>
    <span class="guess-feedback"></span>
  </div>
</div>

<!-- Lista dei temi selezionabili -->
<div class="themes-section">
  <h4>Scegli un tema:</h4>
  <div class="themes-list" id="themesList"></div>
</div>

<!-- Modal per nuova frase/partita -->
<div id="phrase" class="modal hide fade">
  <!-- Form per inserire nuova frase -->
</div>
```

## 🎬 Flusso JavaScript

1. **Caricamento** (`$(document).ready`)
   - Carica l'array `PHRASES` dalla costante
   - Popola il dropdown dei temi
   - Riempie la lista di temi cliccabili

2. **Selezione tema** (click `.theme-btn`)
   - Carica la frase nascostamente
   - Avvia automaticamente il gioco con `startGame()`

3. **Inizio partita** (`startGame()`)
   - Renderizza il tabellone con le celle nascoste
   - Resetta contatori (lettere giocate, feedback)
   - Abilita input (tastiera e form)

4. **Gameplay**
   - **Tastiera**: scopre le lettere (se non in focus sul form)
   - **Form indovinazione**: tenta di indovinare l'intera frase

5. **Vittoria**
   - Tutte le lettere scoperte → messaggio di vittoria
   - Frase indovinata → coriandoli + reveal automatico

## 🎨 CSS - Classi Principali

```css
.tabbellone              /* Contenitore lettere */
.letter-cell            /* Una singola cella lettera */
.letter-cell.uncheck    /* Lettera non scoperta */
.letter-cell.check      /* Lettera scoperta */
.space-cell             /* Spazio tra parole */
.theme-display          /* Box del tema */
.theme-btn              /* Pulsante tema selezionabile */
.theme-btn.selected     /* Tema attualmente selezionato */
.guess-input            /* Input per indovinazione */
.guess-input.error      /* Indovinazione sbagliata */
.guess-feedback         /* Messaggio feedback */
.confetti               /* Contenitore coriandoli */
```

## ⌨️ Shortcut Tastiera

| Tasto | Azione |
|-------|--------|
| **A-Z** | Scopri la lettera |
| **Tab** | Focus sul form di indovinazione |
| **Enter** | Indovina la frase (da form) |

## 🧪 Animazioni

- **Flip lettere** - Rotazione 3D quando scopri una lettera
- **Scuotimento form** - Shake quando indovini male
- **Coriandoli** - Cadono dallo schermo al completamento della frase

## 📦 Dipendenze

- **jQuery 1.9.0** - Manipolazione DOM
- **Bootstrap 2** - Framework CSS
- **HTML5 Shim** - Compatibilità browser vecchi (IE<9)
- **Respond.js** - Media queries per IE

## 🌐 Browser Supportati

- Chrome/Chromium (ultima versione)
- Firefox (ultima versione)
- Safari (ultima versione)
- Edge (ultima versione)
- IE 9+ (con polyfill)

## 📱 Responsive Design

- **Desktop**: Layout ottimale, celle da 60x80px
- **Tablet**: Celle adattate, gap ridotto
- **Mobile**: Celle più piccole, padding ridotto

## 🔧 Funzionalità Implementate

### v2.0 - Versione Attuale
- ✅ Tabellone elegante stile TV
- ✅ Animazioni flip lettere scoperte
- ✅ Indovinazione intera parola con form
- ✅ Coriandoli animati alla vittoria
- ✅ Gestione frasi mediante array JavaScript
- ✅ Categorie/Temi nascosti ai giocatori
- ✅ Display del tema corrente
- ✅ Reset automatico focus tra tabellone e form
- ✅ Contatore partite giocate
- ✅ Contatore lettere giocate
- ✅ Supporto caratteri accentati italiani

### Possibili Miglioramenti Futuri
- [ ] Vite/tentativi limitati (level di difficoltà)
- [ ] Statistiche persistenti (vincite/sconfitte)
- [ ] Suoni/feedback audio
- [ ] Modalità multiplayer locale
- [ ] Conteggio errori con vite
- [ ] Timer per partita
- [ ] Leaderboard

## 📄 Licenza

Vedi il file [LICENSE](LICENSE)

## 👨‍💻 Autori

**Versione Originale**: Realizzato in una mezz'oretta
**Versione 2.0 Moderna**: Rivisitazione completa con design TV-show

---

**Ultimo aggiornamento:** 17 Aprile 2026 - Versione 2.0


