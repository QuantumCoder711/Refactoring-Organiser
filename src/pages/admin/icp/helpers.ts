type EncodingMap = Record<string, string>;

function customSoundex(name: string): string {
    if (!name) return '';

    name = name.toUpperCase();

    const encodingMap: EncodingMap = {
        B: '1', F: '1', P: '1', V: '1',
        C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
        D: '3', T: '3',
        L: '4',
        M: '5', N: '5',
        R: '6'
    };

    const separators: string[] = ['A', 'E', 'I', 'O', 'U', 'H', 'W', 'Y'];

    function getEncodedChar(char: string): string {
        return encodingMap[char] || '';
    }

    let encodedName: string = name[0];
    let prevCode: string = getEncodedChar(name[0]);

    for (let i = 1; i < name.length; i++) {
        const char: string = name[i];
        const code: string = getEncodedChar(char);

        if (separators.includes(char)) {
            prevCode = '';
            continue;
        }

        if (code && code !== prevCode) {
            encodedName += code;
        }
        prevCode = code;
    }

    encodedName = encodedName.substring(0, 1) + encodedName.substring(1).replace(/[^0-9]/g, '');
    encodedName = encodedName.padEnd(4, '0').substring(0, 4);

    return encodedName;
}

function hashName(name: string): number {
    if (!name) return 0;

    const words: string[] = name.split(/\s+/)
        .filter(word => !["AND", "THE", "OF", "INC", "LTD", "LLC", "CORP", "COMPANY", "PVT"].includes(word.toUpperCase()))
        .map(word => word.toLowerCase())
        .sort();

    const hash = words.reduce((acc: number, word: string) => {
        return acc + word.split('').reduce((charAcc: number, char: string) => charAcc + char.charCodeAt(0), 0);
    }, 0);

    return hash;
}

function enhancedCustomSoundex(name: string): string {
    if (!name) return '';

    return customSoundex(name) + hashName(name).toString();
}

export default enhancedCustomSoundex;
export { enhancedCustomSoundex };
