// Frasi organizzate in gruppi (topic/pack). Ogni frase ha: frase, tema, bonus
const PHRASE_GROUPS = {
	"Classici": [
		{ "frase": "LA RUOTA DELLA FORTUNA", "tema": "Game Show", "bonus": 500 },
		{ "frase": "BUONA FORTUNA GIOCATORE", "tema": "Generale", "bonus": 400 }
	],
	"Tecnologia": [
		{ "frase": "ALE E UN PROGRAMMATORE JAVA", "tema": "Programmazione", "bonus": 300 },
		{ "frase": "LA NUOVA APP RIVOLUZIONA IL MERCATO", "tema": "Startup", "bonus": 350 }
	],
	"Bizzarre": [
		{ "frase": "BLOCCARE LA PROPRIA CARTA DI CREDITO PER UN ACQUISTO A SAN FRANCISCO", "tema": "Avventure", "bonus": 1000 }
	]
};

// Lista totale (tutte le frasi), usata come default
var PHRASES = [].concat.apply([], Object.keys(PHRASE_GROUPS).map(function (k) { return PHRASE_GROUPS[k]; }));
