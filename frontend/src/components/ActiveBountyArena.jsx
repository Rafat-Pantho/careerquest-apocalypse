import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActiveBountyArena = ({ bountyData, onComplete, onFlee, onPointsEarned }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const targetCount = bountyData?.targetCount || 15;
    const rewardTotal = bountyData?.reward ? Math.max(10, bountyData.reward) : 100;
    const pointsPerKill = Math.floor(rewardTotal / targetCount) || 10;
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    // Ensure first letter is capitalized for the switch statement
    const rawClass = userData.characterClass || 'Mage';
    const characterClass = rawClass.charAt(0).toUpperCase() + rawClass.slice(1).toLowerCase();

    // React State for HUD
    const [uiKills, setUiKills] = useState(0);
    const [uiHp, setUiHp] = useState(100);
    const [uiStatus, setUiStatus] = useState('playing'); // playing, victory, defeated
    const [isAutoAttack, setIsAutoAttack] = useState(false);

    // Mutable Game State
    const gameState = useRef({
        kills: 0,
        playerHp: 100,
        goblins: [],
        projectiles: [],
        particles: [],
        floatingTexts: [],
        dust: [],
        stars: [],
        time: 0,
        lastSpawn: 0,
        playerCooldown: 0,
        playerAnimState: 'idle',
        playerAnimTimer: 0,
        gameOver: false,
        autoAttack: false
    });

    // Initialize environment arrays once
    useEffect(() => {
        const state = gameState.current;
        // 40+ tiny white stars
        for (let i = 0; i < 45; i++) {
            state.stars.push({
                x: Math.random() * 1000,
                y: Math.random() * 350,
                size: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 2 + 1
            });
        }
        // 20 floating dust particles
        for (let i = 0; i < 20; i++) {
            state.dust.push({
                x: Math.random() * 1000,
                y: Math.random() * 540,
                vx: (Math.random() - 0.5) * 10,
                vy: -(Math.random() * 15 + 10),
                size: Math.random() * 2 + 1
            });
        }
    }, []);

    // Toggle auto attack
    const toggleAutoAttack = useCallback(() => {
        setIsAutoAttack(prev => {
            gameState.current.autoAttack = !prev;
            return !prev;
        });
    }, []);

    const fireAttack = useCallback(() => {
        const state = gameState.current;
        if (state.gameOver || state.playerCooldown > 0) return;

        state.playerAnimState = 'attack';
        state.playerAnimTimer = 0.4;
        state.playerCooldown = 0.8;

        // Find nearest goblin
        let nearest = null;
        let minDist = Infinity;
        for (let g of state.goblins) {
            const d = g.x - 150;
            if (d < minDist && d > 0) {
                minDist = d;
                nearest = g;
            }
        }

        const startX = 170;
        const startY = 320; // Approx staff/weapon height
        
        let vx = 400, vy = 0, pType = 'bolt', pColor = '#ffffff';

        if (nearest) {
            const dx = nearest.x - startX;
            const dy = (nearest.y - 20) - startY; // Aim for chest
            const dist = Math.sqrt(dx*dx + dy*dy);
            const speed = (characterClass === 'Assassin' ? 600 : characterClass === 'Hunter' ? 500 : 400);
            vx = (dx / dist) * speed;
            vy = (dy / dist) * speed;
        }

        switch (characterClass) {
            case 'Mage': pType = 'orb'; pColor = '#a855f7'; break;
            case 'Fighter': pType = 'arc'; pColor = '#facc15'; break;
            case 'Tank': pType = 'shockwave'; pColor = '#3b82f6'; break;
            case 'Assassin': pType = 'dart'; pColor = '#1e293b'; break;
            case 'Healer': pType = 'beam'; pColor = '#fde047'; break;
            case 'Hunter': pType = 'arrow'; pColor = '#22c55e'; break;
            default: pType = 'orb'; pColor = 'white';
        }

        state.projectiles.push({
            id: Math.random(),
            x: startX, y: startY, vx, vy, type: pType, color: pColor, life: 2.0
        });
    }, [characterClass]);

    // Handle spacebar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                fireAttack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fireAttack]);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let lastTime = performance.now();

        // ----------------- DRAWING FUNCTIONS -----------------

        // Safari-safe rounded rect helper (ctx.roundRect not supported in Safari)
        const roundRect = (ctx, x, y, w, h, r) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };

        const drawBackground = (ctx, st) => {
            // Sky/Cave Gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, 351); // 65% of 540 is 351
            skyGrad.addColorStop(0, '#0a0010');
            skyGrad.addColorStop(1, '#1a0030');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, 1000, 351);

            // Stars
            ctx.fillStyle = '#ffffff';
            st.stars.forEach(star => {
                const opacity = 0.4 + 0.6 * Math.sin(st.time * star.speed + star.phase);
                ctx.globalAlpha = opacity;
                ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            // 3 Floating Crystals
            const drawCrystal = (cx, cxY, phase) => {
                const yOffset = Math.sin(st.time * 2 + phase) * 10;
                ctx.save();
                ctx.translate(cx, cxY + yOffset);
                const crystalGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
                crystalGrad.addColorStop(0, '#2dd4bf');
                crystalGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = crystalGrad;
                ctx.globalAlpha = 0.4;
                ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0;
                
                ctx.fillStyle = '#0f766e';
                ctx.beginPath();
                ctx.moveTo(0, -30); ctx.lineTo(10, 0); ctx.lineTo(0, 30); ctx.lineTo(-10, 0);
                ctx.closePath(); ctx.fill();
                
                ctx.fillStyle = '#5eead4';
                ctx.beginPath();
                ctx.moveTo(0, -30); ctx.lineTo(4, 0); ctx.lineTo(0, 30); ctx.lineTo(-4, 0);
                ctx.closePath(); ctx.fill();
                ctx.restore();
            };
            drawCrystal(300, 150, 0);
            drawCrystal(600, 100, 2);
            drawCrystal(850, 180, 4);

            // Ground Floor (bottom 35% -> y: 351 to 540)
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 351, 1000, 189);
            
            ctx.strokeStyle = '#0f0f1c'; // Grout lines
            ctx.lineWidth = 1;
            for (let y = 351; y < 540; y += 40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1000, y); ctx.stroke();
            }
            // Faint static noise approximation via scattered faint rects
            ctx.fillStyle = 'rgba(255,255,255,0.015)';
            for(let i=0; i<100; i++) {
                ctx.fillRect(Math.random()*1000, 351 + Math.random()*189, Math.random()*20+5, Math.random()*5+2);
            }

            // Glow line edge
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'rgba(168,85,247,0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, 351); ctx.lineTo(1000, 351); ctx.stroke();
            ctx.shadowBlur = 0;

            // Torches Left Wall
            const drawTorch = (tx, ty) => {
                ctx.fillStyle = '#450a0a'; // holder
                ctx.fillRect(tx - 3, ty, 6, 15);
                const fh = Math.random() * 6 - 3;
                
                ctx.shadowColor = '#ea580c';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.moveTo(tx, ty - 15 + fh);
                ctx.quadraticCurveTo(tx + 8, ty - 5, tx, ty);
                ctx.quadraticCurveTo(tx - 8, ty - 5, tx, ty - 15 + fh);
                ctx.fill();
                ctx.shadowBlur = 0;
            };
            drawTorch(40, 200);
            drawTorch(120, 180);

            // Right Spawn Portal
            ctx.save();
            ctx.translate(950, 330);
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 20 + Math.sin(st.time * 5) * 10;
            ctx.fillStyle = 'rgba(21, 128, 61, 0.4)';
            ctx.beginPath(); ctx.ellipse(0, 0, 30, 60, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#86efac';
            ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.ellipse(0, 0, 10, 40, 0, 0, Math.PI * 2); ctx.fill();
            
            // Orbiting dots
            ctx.fillStyle = '#4ade80';
            for(let i=0; i<8; i++){
                const angle = (Math.PI * 2 * (i/8)) + st.time * 2;
                ctx.beginPath(); ctx.arc(Math.cos(angle)*35, Math.sin(angle)*65, 3, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();

            // Dust Particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            st.dust.forEach(d => {
                ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
            });
        };

        const drawPlayer = (ctx, st) => {
            ctx.save();
            let px = 150;
            let py = 351 - 35; // base ground point for player
            
            let lunge = 0;
            if (st.playerAnimState === 'attack') {
                const prog = (0.4 - st.playerAnimTimer) / 0.4;
                lunge = Math.sin(prog * Math.PI) * (characterClass === 'Fighter' ? 50 : 35);
                if (characterClass === 'Assassin') lunge = 80;
                if (characterClass === 'Tank') lunge = 40;
            }
            px += lunge;
            
            ctx.translate(px, py);

            if (characterClass === 'Mage') {
                const floatY = Math.sin(st.time * Math.PI) * 8;
                ctx.translate(0, -floatY);
                // Aura
                const grad = ctx.createRadialGradient(0, -35, 0, 0, -35, 50);
                grad.addColorStop(0, 'rgba(168,85,247,0.3)'); grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(0, -35, 50, 0, Math.PI*2); ctx.fill();

                // Robe
                ctx.fillStyle = '#4a0080';
                ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.lineTo(10, -50); ctx.lineTo(-10, -50); ctx.fill();
                ctx.fillStyle = '#a855f7'; // stripes
                ctx.fillRect(-6, -45, 2, 40); ctx.fillRect(4, -45, 2, 40);
                ctx.fillStyle = '#fbbf24'; // belt
                ctx.beginPath(); ctx.arc(0, -25, 4, 0, Math.PI*2); ctx.fill();

                // Face & Hat
                ctx.fillStyle = '#ffedd5';
                ctx.beginPath(); ctx.ellipse(0, -55, 8, 10, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.fillRect(-3, -57, 2, 2); ctx.fillRect(3, -57, 2, 2);
                ctx.beginPath(); ctx.arc(0, -52, 3, 0, Math.PI); ctx.stroke(); // smile
                
                ctx.fillStyle = '#3b0764';
                ctx.beginPath(); ctx.moveTo(-15, -60); ctx.lineTo(0, -90); ctx.lineTo(15, -60); ctx.fill();
                ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(0, -70, 3, 0, Math.PI*2); ctx.fill();

                // Staff
                ctx.fillStyle = '#475569';
                ctx.fillRect(20, -70, 3, 75);
                
                // Orb
                const orbScale = st.playerAnimState === 'idle' ? 1.0 + Math.sin(st.time * 4)*0.2 : 1.2;
                ctx.save(); ctx.translate(21, -75); ctx.scale(orbScale, orbScale);
                const orbGrad = ctx.createRadialGradient(0,0,0,0,0,10);
                orbGrad.addColorStop(0, 'white'); orbGrad.addColorStop(0.5, '#d8b4fe'); orbGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = orbGrad; ctx.beginPath(); ctx.arc(0,0,15, 0, Math.PI*2); ctx.fill();
                // Particles
                ctx.fillStyle = '#d8b4fe';
                for(let i=0; i<3; i++) {
                    const a = st.time*3 + (Math.PI*2/3)*i;
                    ctx.beginPath(); ctx.arc(Math.cos(a)*15, Math.sin(a)*15, 2, 0, Math.PI*2); ctx.fill();
                }
                ctx.restore();
            } 
            else if (characterClass === 'Fighter') {
                const sway = Math.sin(st.time * 2) * 3;
                if(st.playerAnimState === 'idle') ctx.rotate(sway * Math.PI/180);

                ctx.fillStyle = '#1f2937'; // Boots
                ctx.fillRect(-12, -10, 10, 10); ctx.fillRect(2, -10, 10, 10);
                ctx.fillStyle = '#b91c1c'; // Body
                ctx.fillRect(-15, -45, 30, 35);
                ctx.fillStyle = '#fca5a5'; // Chest lines
                ctx.fillRect(-10, -35, 20, 2); ctx.fillRect(-10, -25, 20, 2);
                ctx.fillStyle = '#ea580c'; // Shoulders
                roundRect(ctx, -20, -45, 10, 12, 4); ctx.fill();
                roundRect(ctx, 10, -45, 10, 12, 4); ctx.fill();
                ctx.fillStyle = '#7f1d1d'; // Helmet
                ctx.beginPath(); ctx.arc(0, -55, 12, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.fillRect(-8, -58, 16, 4); // Visor

                // Sword Math
                ctx.save();
                ctx.translate(20, -30);
                if (st.playerAnimState === 'attack') {
                    const prog = (0.4 - st.playerAnimTimer) / 0.4;
                    ctx.rotate(prog * Math.PI/1.5);
                } else {
                    ctx.rotate(-Math.PI/6);
                }
                ctx.fillStyle = '#fde047'; ctx.fillRect(-5, -5, 10, 4); // guard
                ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-2, -35, 4, 30); // blade
                ctx.restore();

                // Shield
                ctx.fillStyle = '#991b1b';
                roundRect(ctx, -25, -40, 15, 35, 3); ctx.fill();
                ctx.fillStyle = '#facc15'; ctx.fillRect(-23, -38, 11, 31);
                ctx.fillStyle = '#991b1b'; ctx.fillRect(-20, -35, 5, 25);
                ctx.fillStyle = '#c0c0c0'; ctx.beginPath(); ctx.arc(-17, -22, 4, 0, Math.PI*2); ctx.fill();
            }
            else if (characterClass === 'Tank') {
                const breathe = Math.sin(st.time * 2) * 1;
                // Ground Aura
                const hpg = ctx.createRadialGradient(0,0,0,0,0,40);
                hpg.addColorStop(0, 'rgba(34,197,94,0.3)'); hpg.addColorStop(1, 'transparent');
                ctx.fillStyle = hpg; ctx.beginPath(); ctx.ellipse(0, 0, 40, 10, 0, 0, Math.PI*2); ctx.fill();

                ctx.fillStyle = '#1e293b'; // Legs
                ctx.fillRect(-20, -15, 15, 15); ctx.fillRect(5, -15, 15, 15);
                ctx.fillStyle = '#475569'; // Body wide
                ctx.fillRect(-30, -55-breathe, 60, 40+breathe);
                ctx.fillStyle = '#334155'; // Helm
                ctx.fillRect(-15, -75-breathe, 30, 20);
                ctx.fillStyle = '#0ea5e9'; // Visor T
                ctx.fillRect(-10, -70-breathe, 20, 4); ctx.fillRect(-2, -70-breathe, 4, 10);
                
                ctx.fillStyle = '#1e293b'; // War hammer hand
                ctx.fillRect(25, -40, 4, 30); // Handle
                ctx.fillStyle = '#64748b'; ctx.fillRect(15, -45, 24, 10); // Head

                // Huge Shield
                ctx.fillStyle = '#0f172a';
                if (st.playerAnimState === 'attack' && st.playerAnimTimer > 0.2) ctx.fillStyle = '#ffffff'; // shield block glow
                roundRect(ctx, -40, -65, 35, 75, 5); ctx.fill();
                ctx.strokeStyle = '#3b82f6'; ctx.lineWidth=2; 
                ctx.beginPath(); ctx.moveTo(-30, -50); ctx.lineTo(-15, -30); ctx.lineTo(-25, -10); ctx.stroke(); // Rune
            }
            else if (characterClass === 'Assassin') {
                ctx.translate(0, 10); ctx.rotate(-5 * Math.PI/180); // Crouched
                
                let alpha = 1.0;
                if (st.playerAnimState === 'idle') alpha = 0.85 + Math.sin(st.time * 10)*0.15;
                if (st.playerAnimState === 'attack') alpha = 0.3;
                ctx.globalAlpha = alpha;

                ctx.fillStyle = '#0f172a'; // Body
                ctx.fillRect(-8, -40, 16, 30);
                ctx.fillRect(-10, -10, 8, 10); ctx.fillRect(2, -10, 8, 10); // Legs

                // Cloak
                ctx.fillStyle = '#312e81';
                ctx.beginPath(); ctx.moveTo(-5, -35); 
                ctx.quadraticCurveTo(-30, -20, -25 + Math.sin(st.time*5)*5, 0); 
                ctx.lineTo(-5, -10); ctx.fill();

                // Hood
                ctx.fillStyle = '#020617';
                ctx.beginPath(); ctx.moveTo(-10, -40); ctx.lineTo(0, -55); ctx.lineTo(10, -40); ctx.fill();
                ctx.fillStyle = '#ef4444'; // Red eyes
                ctx.beginPath(); ctx.arc(2, -45, 1.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(6, -45, 1.5, 0, Math.PI*2); ctx.fill();

                // Daggers
                ctx.fillStyle = '#475569';
                ctx.fillRect(8, -20, 15, 2); ctx.fillRect(-15, -25, 15, 2); // backward dagger
                ctx.fillStyle = '#a855f7'; // poison edge
                ctx.fillRect(12, -21, 10, 1); ctx.fillRect(-15, -26, 10, 1);
                
                ctx.globalAlpha = 1.0;
            }
            else if (characterClass === 'Healer') {
                const floatY = Math.sin(st.time * Math.PI) * 4;
                ctx.translate(0, -floatY);

                // Halo
                ctx.save(); ctx.translate(0, -65); ctx.rotate(st.time);
                ctx.strokeStyle = '#fef08a'; ctx.lineWidth=2; 
                if(st.playerAnimState==='attack') { ctx.shadowColor='#fef08a'; ctx.shadowBlur=10; ctx.strokeStyle='#ffffff'; }
                ctx.beginPath(); ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI*2); ctx.stroke();
                ctx.restore();

                ctx.fillStyle = '#f8fafc'; // Robe
                ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.lineTo(10, -45); ctx.lineTo(-10, -45); ctx.fill();
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; // Trim wave
                ctx.beginPath();
                for(let i=-15; i<=15; i+=5) { ctx.lineTo(i, -2 + Math.sin(i)*3); }
                ctx.stroke();

                // Face
                ctx.fillStyle = '#fed7aa';
                ctx.beginPath(); ctx.arc(0, -55, 8, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#000'; ctx.lineWidth=1;
                ctx.beginPath(); ctx.arc(-3, -56, 2, 0, Math.PI, true); ctx.stroke(); // happy eye
                ctx.beginPath(); ctx.arc(3, -56, 2, 0, Math.PI, true); ctx.stroke();

                // Chest cross
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-2, -35, 4, 12); ctx.fillRect(-6, -31, 12, 4);

                // Staff
                ctx.fillStyle = '#854d0e';
                ctx.fillRect(15, -60, 4, 60);
                if(st.playerAnimState==='attack') {
                    ctx.shadowColor='white'; ctx.shadowBlur=15; ctx.fillStyle='white';
                } else {
                    ctx.fillStyle = '#fef08a';
                }
                ctx.fillRect(15, -65, 4, 15); ctx.fillRect(9, -60, 16, 4); // Staff cross
                ctx.shadowBlur=0;
            }
            else if (characterClass === 'Hunter') {
                ctx.rotate(-10 * Math.PI/180);
                const breathe = Math.sin(st.time * Math.PI) * 2;

                ctx.fillStyle = '#14532d'; // Back leg
                ctx.fillRect(-10, -15, 6, 15);
                ctx.fillStyle = '#166534'; // Body
                ctx.fillRect(-12, -40, 24, 25);
                ctx.fillStyle = '#78350f'; ctx.fillRect(-13, -20, 26, 4); // Belt
                
                ctx.fillStyle = '#15803d'; // Front leg
                ctx.fillRect(4, -15, 6, 15);

                ctx.fillStyle = '#ffedd5'; // Face
                ctx.beginPath(); ctx.arc(0, -48, 8, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#14532d'; // Hood top
                ctx.beginPath(); ctx.arc(0, -48, 9, Math.PI, Math.PI*2); ctx.fill();
                
                // Eyes blinking
                ctx.fillStyle = '#000';
                if (Math.sin(st.time * 2) > 0.95) ctx.fillStyle = '#ffedd5'; // blink
                ctx.fillRect(2, -50, 2, 2); ctx.fillRect(6, -50, 2, 2);

                // Quiver
                ctx.fillStyle = '#450a0a';
                ctx.fillRect(-18, -45, 8, 25);
                ctx.strokeStyle = '#f8fafc'; ctx.lineWidth=1;
                ctx.beginPath(); ctx.moveTo(-16, -45); ctx.lineTo(-14, -55); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-13, -45); ctx.lineTo(-11, -53); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-10, -45); ctx.lineTo(-8, -50); ctx.stroke();

                // Bow
                ctx.save();
                ctx.translate(15, -30 + breathe);
                ctx.strokeStyle = '#523220'; ctx.lineWidth=3;
                ctx.beginPath(); ctx.arc(0, 0, 20, Math.PI*1.3, Math.PI*2.7); ctx.stroke();
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth=1;
                
                let pull = 0;
                if (st.playerAnimState === 'attack' && st.playerAnimTimer > 0.2) pull = -10; // Pulling back
                
                ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(pull, 0); ctx.lineTo(0, 20); ctx.stroke(); // String
                if(st.playerAnimState === 'attack' && st.playerAnimTimer > 0.2) {
                    // Nocked arrow
                    ctx.fillStyle='#22c55e';
                    ctx.fillRect(pull, -1, 20-pull, 2);
                }
                ctx.restore();
            }

            ctx.restore();
        };

        const drawGoblins = (ctx, st) => {
            st.goblins.forEach(g => {
                ctx.save();
                ctx.translate(g.x, g.y);
                
                // Hurt logic
                if (g.hurtTimer > 0) {
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = 'white';
                    ctx.scale(1.3, 1.3);
                }

                const walkT = st.time * 10 + g.id;
                const bob = Math.abs(Math.sin(walkT)) * 4;
                ctx.translate(0, -bob);

                // Legs alternating
                ctx.fillStyle = '#064e3b';
                ctx.save(); ctx.translate(-5, 0); ctx.rotate(Math.sin(walkT) * 0.5); ctx.fillRect(-4, -15, 8, 15); ctx.restore();
                ctx.save(); ctx.translate(5, 0); ctx.rotate(Math.sin(walkT + Math.PI) * 0.5); ctx.fillRect(-4, -15, 8, 15); ctx.restore();

                // Body hunched
                ctx.rotate(-10 * Math.PI/180);
                ctx.fillStyle = '#065f46';
                ctx.fillRect(-15, -35, 30, 25);
                
                // Head
                ctx.fillStyle = '#166534';
                roundRect(ctx, -20, -55, 25, 25, 8); ctx.fill();
                
                // Ears
                ctx.fillStyle = '#14532d';
                ctx.beginPath(); ctx.moveTo(-20, -45); ctx.lineTo(-30, -35); ctx.lineTo(-20, -35); ctx.fill();
                ctx.beginPath(); ctx.moveTo(5, -45); ctx.lineTo(15, -35); ctx.lineTo(5, -35); ctx.fill();

                // Eyes
                const eyeGrad = ctx.createRadialGradient(-10, -45, 0, -10, -45, 4);
                eyeGrad.addColorStop(0, '#f87171'); eyeGrad.addColorStop(1, '#991b1b');
                ctx.fillStyle = eyeGrad;
                ctx.beginPath(); ctx.arc(-10, -45, 4, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(-2, -45, 4, 0, Math.PI*2); ctx.fill();

                // Nose
                ctx.fillStyle = '#064e3b';
                ctx.beginPath(); ctx.ellipse(-6, -40, 3, 2, 0, 0, Math.PI*2); ctx.fill();

                // Mouth jagged
                ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-15, -35); ctx.lineTo(-12, -37); ctx.lineTo(-9, -34); ctx.lineTo(-6, -37); ctx.lineTo(-2, -35);
                ctx.stroke();

                // Arm with club
                ctx.save();
                ctx.translate(-5, -25);
                ctx.rotate(Math.sin(walkT) * 0.5);
                ctx.fillStyle = '#15803d'; ctx.fillRect(-3, 0, 6, 20); // arm
                ctx.fillStyle = '#78350f'; ctx.fillRect(-5, 15, 10, 15); ctx.fillRect(0, 30, 8, 4); // club
                ctx.restore();

                ctx.globalCompositeOperation = 'source-over'; // Reset

                // HP Bar
                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(-15, -65, 30, 4);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(-15, -65, 30 * (g.hp/g.maxHp), 4);

                ctx.restore();
            });
        };

        const drawProjectilesAndEffects = (ctx, st) => {
            // Projectiles
            st.projectiles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                const angle = Math.atan2(p.vy, p.vx);
                ctx.rotate(angle);

                ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
                ctx.shadowColor = p.color; ctx.shadowBlur = 10;

                if (p.type === 'orb') {
                    const grd = ctx.createRadialGradient(0,0,0,0,0,8);
                    grd.addColorStop(0, '#fff'); grd.addColorStop(0.4, p.color); grd.addColorStop(1, 'transparent');
                    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
                    // Trail
                    ctx.fillStyle = p.color; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI*2); ctx.fill();
                    ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(-20, 0, 3, 0, Math.PI*2); ctx.fill();
                } else if (p.type === 'arc') {
                    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-10, 0, 15, -Math.PI/3, Math.PI/3); ctx.stroke();
                } else if (p.type === 'shockwave') {
                    ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 10, 30, 0, 0, Math.PI*2); ctx.stroke();
                } else if (p.type === 'dart') {
                    ctx.globalAlpha = 0.8; ctx.fillRect(-10, -1.5, 20, 3);
                } else if (p.type === 'beam') {
                    ctx.fillRect(-20, -4, 40, 8); ctx.fillStyle='#fff'; ctx.fillRect(-15, -2, 30, 4);
                } else if (p.type === 'arrow') {
                    ctx.fillStyle='#78350f'; ctx.fillRect(-12, -1.5, 24, 3); // shaft
                    ctx.fillStyle=p.color; ctx.beginPath(); ctx.moveTo(12, -4); ctx.lineTo(18, 0); ctx.lineTo(12, 4); ctx.fill(); // tip
                    ctx.fillStyle='#f8fafc'; ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-8, 0); ctx.lineTo(-12, 3); ctx.fill(); // fletch
                }
                ctx.restore();
            });

            // Particles
            st.particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life * 2; // Fade out quickly
                if (ctx.globalAlpha > 1) ctx.globalAlpha = 1;
                if (ctx.globalAlpha < 0) ctx.globalAlpha = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            // Floating Texts
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            st.floatingTexts.forEach(ft => {
                ctx.fillStyle = `rgba(253, 224, 71, ${ft.life})`; // Yellow
                ctx.shadowColor = `rgba(0,0,0,${ft.life})`; ctx.shadowBlur = 4;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.shadowBlur = 0;
            });

            // Cooldown Arc near player
            if (st.playerCooldown > 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.lineWidth = 4;
                const prog = 1 - (st.playerCooldown / 0.8);
                ctx.beginPath(); ctx.arc(150, 380, 20, -Math.PI/2, -Math.PI/2 + (Math.PI*2*prog)); ctx.stroke();
            }
        };

        // ----------------- UPDATE LOGIC -----------------

        const updateGame = (dt) => {
            const st = gameState.current;
            if (st.gameOver) return;

            st.time += dt;

            // Update Arrays
            st.dust.forEach(d => {
                d.y += d.vy * dt; d.x += d.vx * dt;
                if(d.y < 0) { d.y = 540; d.x = Math.random()*1000; }
            });

            if (st.playerAnimTimer > 0) {
                st.playerAnimTimer -= dt;
                if (st.playerAnimTimer <= 0) st.playerAnimState = 'idle';
            }
            if (st.playerCooldown > 0) {
                st.playerCooldown -= dt;
                if (st.playerCooldown < 0) st.playerCooldown = 0;
            }

            // Goblin Spawning
            if (st.kills + st.goblins.length < targetCount && st.time - st.lastSpawn > 1.5) {
                if (st.goblins.length < 4) {
                    st.goblins.push({
                        id: Math.random(),
                        x: 950, y: 351,
                        hp: 100, maxHp: 100,
                        speed: 50 + Math.random()*20,
                        hurtTimer: 0
                    });
                    st.lastSpawn = st.time;
                }
            }

            // Goblins moving & attacking player
            for (let i = st.goblins.length - 1; i >= 0; i--) {
                const g = st.goblins[i];
                if (g.hurtTimer > 0) g.hurtTimer -= dt;
                
                g.x -= g.speed * dt;
                if (g.x <= 170) {
                    // Reached player
                    g.x = 190; // Bounce back
                    st.playerHp -= 8;
                    setUiHp(st.playerHp);
                    if (st.playerHp <= 0) {
                        st.gameOver = true;
                        setUiStatus('defeated');
                    }
                }
            }

            // Auto Attack
            if (st.autoAttack && st.goblins.length > 0 && st.playerCooldown <= 0) {
                fireAttack();
            }

            // Projectiles
            for (let i = st.projectiles.length - 1; i >= 0; i--) {
                const p = st.projectiles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;

                // Collisions
                let hitGoblin = null;
                for (let j = 0; j < st.goblins.length; j++) {
                    const g = st.goblins[j];
                    if (Math.abs(g.x - p.x) < 25 && p.y > g.y - 60 && p.y < g.y) {
                        hitGoblin = g;
                        break;
                    }
                }

                if (hitGoblin || p.life <= 0 || p.x > 1000) {
                    st.projectiles.splice(i, 1);
                    if (hitGoblin) {
                        hitGoblin.hp -= 50;
                        hitGoblin.hurtTimer = 0.15;
                        
                        // Particles
                        const colors = ['#22c55e', '#ef4444', '#facc15', '#a855f7', '#ffffff'];
                        for(let k=0; k<8; k++){
                            const angle = (Math.PI*2/8) * k;
                            st.particles.push({
                                x: hitGoblin.x, y: hitGoblin.y - 30,
                                vx: Math.cos(angle)*150, vy: Math.sin(angle)*150,
                                life: 0.5, color: colors[Math.floor(Math.random()*colors.length)]
                            });
                        }

                        if (hitGoblin.hp <= 0) {
                            st.floatingTexts.push({ x: hitGoblin.x, y: hitGoblin.y - 40, text: `+${pointsPerKill} EXP`, life: 1.0 });
                            st.goblins = st.goblins.filter(g => g.id !== hitGoblin.id);
                            st.kills++;
                            setUiKills(st.kills);
                            if (onPointsEarned) onPointsEarned(pointsPerKill);

                            if (st.kills >= targetCount) {
                                st.gameOver = true;
                                setUiStatus('victory');
                                setTimeout(() => onComplete(), 3000);
                            }
                        }
                    }
                }
            }

            // Particles
            for (let i = st.particles.length-1; i >= 0; i--) {
                st.particles[i].x += st.particles[i].vx * dt;
                st.particles[i].y += st.particles[i].vy * dt;
                st.particles[i].life -= dt;
                if (st.particles[i].life <= 0) st.particles.splice(i, 1);
            }

            // Float text
            for (let i = st.floatingTexts.length-1; i >= 0; i--) {
                st.floatingTexts[i].y -= 60 * dt;
                st.floatingTexts[i].life -= dt;
                if (st.floatingTexts[i].life <= 0) st.floatingTexts.splice(i, 1);
            }
        };

        const loop = (timestamp) => {
            try {
                const dt = Math.min(0.05, Math.max(0.008, (timestamp - lastTime) / 1000));
                lastTime = timestamp;

                updateGame(dt);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackground(ctx, gameState.current);
                if (gameState.current.playerHp > 0) drawPlayer(ctx, gameState.current);
                drawGoblins(ctx, gameState.current);
                drawProjectilesAndEffects(ctx, gameState.current);
            } catch (err) {
                console.error('Arena render error:', err);
            }
            animationFrameId = requestAnimationFrame(loop);
        };
        animationFrameId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animationFrameId);
    }, [targetCount, pointsPerKill, onComplete, onPointsEarned, fireAttack, characterClass]);

    const handleCanvasClick = (e) => {
        fireAttack();
    };

    return (
        <div ref={containerRef} className="relative w-full h-[540px] bg-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.2)] overflow-hidden">
            
            {/* CANVAS */}
            <canvas 
                ref={canvasRef} 
                width={1000} 
                height={540} 
                className="w-full h-full object-cover cursor-crosshair"
                onClick={handleCanvasClick}
            ></canvas>

            {/* Overlays */}
            
            {/* HUD Top Left */}
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur border border-purple-500/30 rounded-xl px-5 py-3 shadow-lg pointer-events-none">
                <h2 className="text-white font-serif font-bold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase">
                    {bountyData?.title || 'System Clearout'}
                </h2>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-green-400 font-mono font-bold text-sm">
                        Goblins Slain: {uiKills} / {targetCount}
                    </p>
                    <p className="text-red-400 font-mono font-bold text-sm ml-6">
                        HP: {Math.max(0, uiHp)}%
                    </p>
                </div>
                {/* Progress bars */}
                <div className="w-full bg-gray-900 h-2 mt-2 rounded-full overflow-hidden border border-gray-800 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300" style={{ width: `${(uiKills / targetCount) * 100}%` }}></div>
                </div>
                <div className="w-full bg-gray-900 h-1 mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, uiHp)}%` }}></div>
                </div>
            </div>

            {/* HUD Top Right */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                    onClick={toggleAutoAttack}
                    className={`px-4 py-2 flex items-center gap-2 rounded border text-xs font-bold tracking-wider transition-colors uppercase ${isAutoAttack ? 'bg-green-900/80 border-green-500 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-900/80 border-gray-500 text-gray-400'}`}
                >
                    AUTO ⚔
                </button>
                <button 
                    onClick={onFlee} 
                    className="px-4 py-2 bg-red-900/80 hover:bg-red-800 text-red-300 rounded border border-red-500 text-xs font-bold tracking-wider transition-colors uppercase"
                >
                    Flee Combat
                </button>
            </div>

            {/* HUD Central Bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full text-center">
                <p className="text-white/50 text-xs font-bold tracking-widest uppercase">
                    PRESS SPACE OR CLICK TO ATTACK
                </p>
            </div>

            {/* Simulated Nameplate Over Canvas via Absolute Div */}
            <div className="absolute bottom-[100px] left-[110px] w-[80px] z-10 pointer-events-none text-center">
                <p className="text-white font-mono text-[10px] bg-black/60 rounded px-1">{characterClass.toUpperCase()} LVL5</p>
                <div className="w-full bg-gray-900 h-1 mt-1 rounded-full"><div className="h-full bg-red-500" style={{width: `${Math.max(0, uiHp)}%`}}></div></div>
                <div className="w-full bg-gray-900 h-1 mt-0.5 rounded-full"><div className="h-full bg-blue-500 w-[80%]"></div></div>
            </div>

            {/* Victory / Defeat States */}
            <AnimatePresence>
                {uiStatus === 'victory' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center pointer-events-none"
                    >
                        <div className="text-center p-8 bg-gray-900 border-2 border-yellow-500/80 rounded-2xl shadow-[0_0_100px_rgba(234,179,8,0.4)]">
                            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 font-serif mb-2 tracking-widest uppercase shadow-black drop-shadow-lg">
                                AREA SECURED
                            </h1>
                            <p className="text-green-400 font-mono text-xl mb-8 tracking-widest">
                                B O U N T Y   C L E A R E D
                            </p>
                            <p className="text-white/60 mb-8 italic">Transmission ended.</p>
                            <div className="loader inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </motion.div>
                )}
                {uiStatus === 'defeated' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-red-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-10"
                    >
                        <h1 className="text-5xl font-extrabold text-red-500 font-serif mb-4 tracking-widest uppercase shadow-black drop-shadow-2xl">
                            DEFEATED IN COMBAT
                        </h1>
                        <p className="text-red-300 font-mono text-lg mb-8 tracking-widest">
                            You have fallen to the goblin horde.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    // Soft Reset Game
                                    const st = gameState.current;
                                    st.playerHp = 100; st.kills = 0; st.goblins = []; st.gameOver = false;
                                    st.projectiles = []; st.particles = [];
                                    setUiHp(100); setUiKills(0); setUiStatus('playing');
                                }} 
                                className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white rounded border border-red-400 text-sm font-bold tracking-widest uppercase cursor-pointer"
                            >
                                TRY AGAIN
                            </button>
                            <button 
                                onClick={onFlee} 
                                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-red-400 rounded border border-red-900 text-sm font-bold tracking-widest uppercase cursor-pointer"
                            >
                                FLEE
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActiveBountyArena;
