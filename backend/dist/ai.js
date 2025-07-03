"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextAIMove = getNextAIMove;
// Fonction qui fait l'appel POST et renvoie le prochain **targetY**
async function getNextAIMove(config) {
    try {
        const res = await fetch('http://ai:3003/next-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        const data = await res.json();
        return { targetY: data.targetY };
    }
    catch (err) {
        console.error('Erreur IA:', err);
        // fallback : cible milieu de terrain
        return { targetY: config.tableHeight / 2 };
    }
}
