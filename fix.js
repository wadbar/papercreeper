const fs = require('fs');
let c = fs.readFileSync('src/components/MapEditor3D.tsx', 'utf8');
c = c.replace(/mb\.pos\[1\] === mb\.pos\[1\] && mb\.pos\[2\] === mb\.pos\[2\]/g, 'mb.pos[1] === nb.pos[1] && mb.pos[2] === nb.pos[2]');
fs.writeFileSync('src/components/MapEditor3D.tsx', c);
