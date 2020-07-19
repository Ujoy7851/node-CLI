#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

// let type = process.agrv[2];
// let name = process.argv[3];
// let directory = process.argv[4] || '.';

const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Template</title>
</head>
<body>
    <h1>Hello</h1>
    <p>CLI</p>
</body>
</html>`;

const routerTemplate = `const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        res.send('ok');
    } catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;`;

const exist = (dir) => {
    try {
        fs.accessSync(dir, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch(e) {
        return false;
    }
};

const mkdirp = (dir) => {
    const dirname = path.relative('.', path.normalize(dir)).split(path.delimiter).filter(p => !!p);
    dirname.forEach((d, index) => {
        const pathBuilder = dirname.slice(0, index + 1).join(path.delimiter);
        if(!exist(pathBuilder)) {
            fs.mkdirSync(pathBuilder);
        }
    })
};

const makeTemplate = () => {
    mkdirp(directory);
    if(type === 'html') {
        const pathToFile = path.join(directory, `${name}.html`);
        if(exist) {
            console.error('이미 해당 파일이 존재합니다.');
        } else {
            fs.writeFileSync(pathToFile, htmlTemplate);
            console.log(pathToFile, '생성 완료');
        }
    } else if(type === 'express-router') {
        const pathToFile = path.join(directory, `${name}.js`);
        if(exist) {
            console.error('이미 해당 파일이 존재합니다.');
        } else {
            fs.writeFileSync(pathToFile, htmlTemplate);
            console.log(pathToFile, '생성 완료');
        }
    } else {
        console.error('html 또는 express-router를 입력하세요.');
    }
};

const copyFile = (name, directory) => {
    if(exist(name)) {
        mkdirp(directory);
        fs.copyFileSync(name, path.join(directory, name));
        console.log(`${name}이 복사되었습니다.`)
    } else {
        console.error('파일이 존재하지 않습니다.');
    }
}

const removeFile = (path) => {
    if(exist(path)) {
        try{
            const dir = fs.readdirSync();
            dir.forEach((d) => {
                removeFile(path.join(path, d));
            });
            fs.rmdirSync(path);
            console.log(`${path} 폴더를 삭제했습니다.`);
        } catch(e) {
            fs.unlinkSync(path);
            console.log(`${path} 파일을 삭제했습니다.`);
        }
    } else {
        console.error('파일 또는 폴더가 존재하지 않습니다.');
    }
}


program
    .version('0.0.1', '-v, --version')
    .name('cli');

program
    .command('template <type>')
    .usage('<type> --filename [filename] --path [path]')
    .description('템플릿을 생성합니다.')
    .alias('tmpl')
    .option('-f, --filename [filename]', '파일명을 입력하세요.', 'index')
    .option('-d, --directory [path]', '생성 경로를 입력하세요.', '.')
    .action((type, options) => {
        makeTemplate(type, options.filename, options.directory);
    });

program
    .command('copy <name> <directory>')
    .usage('<name> <directory>')
    .description('파일을 복사합니다.')
    .action((name, directory) => {
        copyFile(name, directory);
    })
    .usage('<path>')
    .description('지정한 경로의 하위 파일/폴더를 지웁니다.')
    .action((path) => {
        removeFile(path);
    })

program
    .action((cmd, args) => {
        if(args) {
            console.log(chalk.bold.red('해당 명령어를 찾을 수 없습니다.'));
            program.help();
        } else {
            inquirer.prompt([{
                type: 'list',
                name: 'type',
                message: '템플릿 종류를 선택하세요.',
                choices: ['html', 'express-router'],
            }, {
                type: 'input',
                name: 'name',
                message: '파일의 이름을 하세요.',
                default: 'index',
            }, {
                type: 'input',
                name: 'directory',
                message: '파일을 저장할 경로를 입력하세요.',
                defalut: '.',
            }, {
                type: 'confirm',
                name: 'confirm',
                message: '생성하시겠습니까?',
            }])
                .then((answer) => {
                    if(answer.confirm) {
                        makeTemplate(answer.type, answer.name, answer.directory);
                        console.log(chalk.bold.red('터미널을 종료합니다.'));
                    }
                });
        }
    })
    .parse(process.argv);