// Setup prompt for terminal
const user = 'guest';
const server = 'zacs-portfolio';

// Return user prompt as traditional Ubunut style
function prompt() {
    return `<green>${user}@${server}</green>:<blue>${cwd}</blue>$ `;
}

//Used to print directories for ls commmand
function print_home() {
    term.echo(dirs.map(dir => {
        return `<blue class="directory">${dir}</blue>`;
    }).join('\n'));
}

// Joke API also adds typing animation to appear as if user typing joke into terminal
const url = 'https://v2.jokeapi.dev/joke/Programming';

// String representing home (~) will be CWD
const root = '~';
let cwd = root;

// Directories with names related to portfolio/skills
const directories = {
    education: [
        '',
        '<white>Education:</white>',

        '* <a href="https://en.wikipedia.org/wiki/University_of_Salford">University of Salford</a> <yellow>"Computer Science with Cyber Security"</yellow> 2018-2021',
        '* <a href="https://www.cleevepark-tkat.org/">Secondary School</a> Cleeve Park School <yellow>"Computer Systems"</yellow> 2009-2016',
        ''
    ].flat(),
    skills: [
        '',
        '<white>Languages</white>',

        [
            'JavaScript',
            'TypeScript',
            'C#',
            'Java',
            'SQL',
            'PHP',
            'BASH'
        ].map(lang => `* <yellow>${lang}</yellow>`),
        '',
        '<white>libraries</white>',
        [
            'React.js',
            'JQuery'
        ].map(lib => `* <green>${lib}</green>`),
        '',
        '<white>Tools</white>',
        [
            'Docker',
            'git',
            'GNU/Linux',
            'Kubernetes'
        ].map(lib => `* <blue>${lib}</blue>`),
        ''
    ].flat()
};

const dirs = Object.keys(directories);

// Command fed into terminal
const commands = {
    help() {
        term.echo(`List of available commands: ${help}`);
    },
    echo(...args) {
        if (args.length > 0) {
            term.echo(args.join(' '));
        }
    },
    cd(dir = null) {
        if (dir === null || (dir === '..' && cwd !== root)) {
            cwd = root;
        } else if (dir.startsWith('~/') && dirs.includes(dir.substring(2))) {
            cwd = dir;
        } else if (dir.startsWith('../') && cwd !== root &&
            dirs.includes(dir.substring(3))) {
            cwd = root + '/' + dir.substring(3);
        } else if (dirs.includes(dir)) {
            cwd = root + '/' + dir;
        } else {
            this.error('Wrong directory');
        }
    },
    ls(dir = null) {
        if (dir) {
            if (dir.match(/^~\/?$/)) {
                // ls ~ or ls ~/
                print_home();
            } else if (dir.startsWith('~/')) {
                const path = dir.substring(2);
                const dirs = path.split('/');
                if (dirs.length > 1) {
                    this.error('Invalid directory');
                } else {
                    const dir = dirs[0];
                    this.echo(directories[dir].join('\n'));
                }
            } else if (cwd === root) {
                if (dir in directories) {
                    this.echo(directories[dir].join('\n'));
                } else {
                    this.error('Invalid directory');
                }
            } else if (dir === '..') {
                print_home();
            } else {
                this.error('Invalid directory');
            }
        } else if (cwd === root) {
            print_home();
        } else {
            const dir = cwd.substring(2);
            this.echo(directories[dir].join('\n'));
        }
    },
    async joke() {
        const res = await fetch(url);
        const data = await res.json();
        if (data.type == 'twopart') {
            // as said before in every function, passed directly
            // to the terminal, you can use `this` object
            // to reference terminal instance
            this.echo(`Q: ${data.setup}`);
            this.echo(`A: ${data.delivery}`);
        } else if (data.type === 'single') {
            this.echo(data.joke, { delay: 50, typing: true });
        }
    }
};

//Create new Intl.Format formatter for tidy looking list
const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });

//Create list of commands from the function names in const commands
const command_list = Object.keys(commands);
const formatted_list = command_list.map(cmd => {
      return `<white class="command">${cmd}</white>`;
  });
const help = formatter.format(formatted_list);

// Terminal initialization point
const term = $('body').terminal(commands, {
    greetings: false,
    checkArity: false,
    exit: false,
    completion(string) {
        // in every function we can use `this` to reference term object
        const cmd = this.get_command();
        // we process the command to extract the command name
        // and the rest of the command (the arguments as one string)
        const { name, rest } = $.terminal.parse_command(cmd);
        if (['cd', 'ls'].includes(name)) {
            if (rest.startsWith('~/')) {
                return dirs.map(dir => `~/${dir}`);
            }
            if (rest.startsWith('../') && cwd != root) {
                return dirs.map(dir => `../${dir}`);
            }
            if (cwd === root) {
                return dirs;
            }
        }
        return Object.keys(commands);
    },
    prompt
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

//JQuery onClick listener for when user clicks a command shown on the terminal, run that command
term.on('click', '.command', function() {
    const command = $(this).text();
    term.exec(command);
 });

//Regular expression used to make only commands white
 const any_command_re = new RegExp(`^\s*(${command_list.join('|')})`);

 $.terminal.new_formatter([re, function(_, command, args) {
    return `<white>${command}</white><aqua>${args}</aqua>`;
}]);


