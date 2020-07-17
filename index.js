const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.clear();

const answerCallback = (answer) => {
    if(answer !== 'y' && answer !== 'n' || !answer) { 
        console.log('y 또는 n을 입력하셔야 합니다.');
        rl.question('질문 (y/n)', answerCallback);
    } else {
        console.log('answer:', answer);
        rl.close();
    }
};

rl.question('질문 (y/n)', answerCallback);

