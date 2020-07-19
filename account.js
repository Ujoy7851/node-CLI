#!/usr/bin/env node
const { program } = require('commander');
const inquirer = require('inquirer');

const { version } = require('./package');
const { sequelize, Account } = require('./models')

program
    .version(version, '-v, --version')
    .name('account');

program
    .command('revenue <money> <desc>')
    .description('수입 기록')
    .action(async(money, desc) => {
        await sequelize.sync();
        await Account.create({
            money: parseInt(money, 10),
            desc,
            type: true
        });
        await sequelize.close();
    });

program 
    .command('expense <money> <desc>')
    .description('지출 기록')
    .action(async (money, desc) => {
        await sequelize.sync();
        await Account.create({
            money: parseInt(money, 10),
            desc,
            type: false
        });
        await sequelize.close();
    });

program
    .command('balance')
    .description('잔액 기록')
    .action(async() => {
        await sequelize.sync();
        const logs = await Account.findAll({});
        const revenue = logs.filter(l => l.type === true).reduce((acc, cur) => acc + cur.money, 0);
        const expense = logs.filter(l => l.type === false).reduce((acc, cur) => acc + cur.money, 0);
        console.log(`${revenue - expense}원 남았습니다.`);
        await sequelize.close();
    });


program
    .action((cmd, args) => {
        if(args) {
            console.log('해당 명령어를 찾을 수 없습니다.');
            program.help();
        } else {
            inquirer.prompt([{
                type: 'list',
                name: 'type',
                message: '분류를 선택하세요.',
                choices: ['수입', '지출', '잔액'],
            }, {
                type: 'input',
                name: 'money',
                message: '금액을 입력하세요.',
                default: '0',
                // when: answer => answer.type === '수입' || '지출'
                when: answer => ['수입', '지출'].includes(answer.type)
            }, {
                type: 'input',
                name: 'desc',
                message: '상세 내역을 작성하세요.',
                defalut: '.',
                when: answer => ['수입', '지출'].includes(answer.type)
            }, {
                type: 'confirm',
                name: 'confirm',
                message: '진행하시겠습니까?',
            }])
                .then(async (answer) => {
                    if(answer.confirm) {
                        if (answer.type === '수입') {
                            await sequelize.sync();
                            await Account.create({
                                money: parseInt(answer.money, 10),
                                desc: answer.desc,
                                type: true
                            });
                            await sequelize.close();
                        } else if (answer.type === '지출') {
                            await sequelize.sync();
                            const logs = await Account.findAll({});
                            const revenue = logs.filter(l => l.type === true).reduce((acc, cur) => acc + cur.money, 0);
                            const expense = logs.filter(l => l.type === false).reduce((acc, cur) => acc + cur.money, 0);
                            if((revenue - expense) >= parseInt(answer.money)) {
                                await Account.create({
                                    money: parseInt(answer.money, 10),
                                    desc: answer.desc,
                                    type: false
                                });
                            } else {
                                console.log('금액이 모자랍니다.');
                            }
                            await sequelize.close();
                        } else {
                            await sequelize.sync();
                            const logs = await Account.findAll({});
                            const revenue = logs.filter(l => l.type === true).reduce((acc, cur) => acc + cur.money, 0);
                            const expense = logs.filter(l => l.type === false).reduce((acc, cur) => acc + cur.money, 0);
                            console.log(`${revenue - expense}원 남았습니다.`);
                            await sequelize.close();
                        }
                    }
                });
        }
    })
    .parse(process.argv);