const { PNG } = require('pngjs');
const prompt = require('prompt');
const { fetch } = require('undici')

function componentToHex(component) {
    const final = component.toString(16);
    return final.length == 1 ? '0' + final : final;
}

const rgbToHex = (...args) => args.map(componentToHex).join('');

prompt.start();
let jOrK;

prompt.get(['username', {
    name: 'Java Or kotlin? (<java/kotlin>)',
    enum: [
        'java',
        'kotlin'
    ]
}]).then(({ username, /* lmao, i forgot how to use js. pull request maybe? 😉 */ 'Java Or kotlin? (<java/kotlin>)': jOrC }) => {
jOrK = jOrC
fetchUsername(username)
})

const png = new PNG();
function parseToTellraw(){
    const lines = [];
    for (let x = 0; x < 8; x++) {
        const line = [];
        for (let y = 0; y < 8; y++) {
            
            const [red, green, blue] = getPixel(y + 8, x + 8);
            const [outerRed, outerGreen, outerBlue, outerOpacity] = getPixel(y + 40, x + 8);
            const [r, g, b] = [[red, outerRed], [green, outerGreen], [blue, outerBlue]].map(c => outerOpacity === 255 ? c[1] : c[0]);
            
            const lc = line[line.length - 1]
            if(lc?.color === `#${rgbToHex(r, g, b)}`){ 
                lc.text += '■'
            } else {
                
                line.push({
                    text: '■',
                    color: `#${rgbToHex(r, g, b)}`
                });
            }
        }
        line.push('\n')
        lines.push(...line);
    }
    lines.shift();
    return lines;

}

function trToJava(tr){
    let final = [];
    tr.forEach(element => {
        if (typeof element === 'string') return final.push('Component.text(\'\\n\')'   )
        final.push(`Component.text("${element.text}").color(TextColor.color(0x${element.color.slice(1)}))`);
    });
    return final.map((x, i) => i !== 0 ? x + ')' : x).join('.append(');
}
function trToKotlin(tr){
    let final = [];
    tr.forEach(element => {
        if (typeof element === 'string') return final.push('Component.text(\'\\n\')'   )
        final.push(`Component.text("${element.text}").color(TextColor { 0x${element.color.slice(1)} })`);
    });
    return final.map((x, i) => i !== 0 ? x + ')' : x).join('.append(');
}
png.on('parsed', () => {
    const tellraw = parseToTellraw();
    const jorc = jOrK == 'java' ? trToJava(tellraw) : trToKotlin(tellraw);
    console.log(jorc)
});

function getPixel(x, y) {
    const id = (png.width * y + x) << 2;
    return [0, 1, 2, 3].map(index => png.data[id + index]);
}

async function fetchUsername(username) {
    fetch(`https://mc-heads.net/json/get_user?search&u=${username}`, {
    headers: {
        accept: 'application/json'
    }
}).then(r => r.json()).then(x => {
    const {uuid}=x;
    const link=`https://mc-heads.net/download/${uuid}`;
    require('axios').default(link, {
        responseType: 'stream'
    }).then(x => {
        x.data.pipe(png);
    })
});
}