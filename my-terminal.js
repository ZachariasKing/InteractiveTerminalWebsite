// Command fed into terminal
const commands = {};

// Terminal initialization point
const term = $('body').terminal(commands, {
    greetings: false
});

//Pause Terminal until Greeting text appears
term.pause();


// Preload font for main greeting
const font = 'Ogre';
figlet.defaults({ fontPath: 'https://unpkg.com/figlet/fonts' });
figlet.preloadFonts([font], ready);

// Render figlet ASCII text
function render(text) {
    const cols = term.cols();
    return figlet.textSync(text, {
        font: font,
        width: cols,
        whitespaceBreak: true
    });
}

// Ready function initialises greeting message
function ready() {
    term.echo(() => {
      const ascii = rainbow(render('Zac\'s Terminal Portfolio'));
      return `${ascii}\nWelcome to my Terminal Portfolio\n`;
    }).resume();
 }


// Function to remove all spaces and newlines from the end
function trim(str) {
    return str.replace(/[\n\s]+$/, '');
}

// Uses lolcat to call function for each character changing it's color to hex value causing rainbow effect
function rainbow(string) {
    return lolcat.rainbow(function(char, color) {
        char = $.terminal.escape_brackets(char);
        return `[[;${hex(color)};]${char}]`;
    }, string).join('\n');
}

// This function converts a color object with .red, .green, and .blue properties (each representing RGB values between 0 and 255) into a hexadecimal color string (like #ff9900).
function hex(color) {
    return '#' + [color.red, color.green, color.blue].map(n => {
        return n.toString(16).padStart(2, '0');
    }).join('');
}





