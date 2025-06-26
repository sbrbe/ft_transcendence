"use strict";
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = new WebSocket(`ws://${location.host}/ws/`);
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
