// Frasi organizzate in gruppi (topic/pack). Ogni frase ha: frase, tema, bonus
const PHRASE_GROUPS = {
	"8 Giugno 2000": [
		{ "frase": "Si balla al ritmo di Vamos a bailar", "tema": "In spiaggia", "bonus": 1000 },
		{ "frase": "Kanye West compie ventitre anni", "tema": "YE", "bonus": 1000 },
		{ "frase": "Al cinema Russell Crowe è il gladiatore", "tema": "Al Colosseo", "bonus": 1000 }
	],
	"Baby Gaia": [
		{ "frase": "Guardare ripetutamente gli aristogatti e pippi", "tema": "Videocasette", "bonus": 1500 },
		{ "frase": "Le sue winx preferite sono Bloom e stella", "tema": "Con le Ali", "bonus": 1000 },
		{ "frase": "Il jet di polly e la casa di barbie sono il suo tesoro segreto", "tema": "Riccanza", "bonus": 2000 }
	],
	"Dall'Armadio di Gaia": [
		{ "frase": "Contiene ben quarantadue borse", "tema": "Come una Boutique", "bonus": 1000 },
		{ "frase": "Alla laurea di giulia con il completo di joker", "tema": "Ma come ti vesti?!", "bonus": 1000 },
		{ "frase": "Puoi trovare i sandali di cristo e quelli da scoglio", "tema": "Buon samaritano", "bonus": 1000 }
	],
	"le avventure di Gaia": [
		{ "frase": "La grande punto esce dal parcheggio da sola", "tema": "Indipendenza", "bonus": 1000 },
		{ "frase": "Essere fermata all'aeroporto per un chorizo", "tema": "Olè", "bonus": 1000 },
		{ "frase": "D'estate a finestrini chiusi per i serpenti volanti", "tema": " Con il caldo", "bonus": 1000 }
	],
	"bonus":[
		{ "frase": "Ballare all'olimpico con scarpe discutibili", "tema": "Il 6 giugno", "bonus": 1000 }
	]
};

// Lista totale (tutte le frasi), usata come default
var PHRASES = [].concat.apply([], Object.keys(PHRASE_GROUPS).map(function (k) { return PHRASE_GROUPS[k]; }));
