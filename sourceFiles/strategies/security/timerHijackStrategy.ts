import { MeyerStrategyAPI } from '../../meyer/types.ts'

export default function (api: MeyerStrategyAPI) {
    // Try to create an infinite loop of timeouts
    let i = 0;
    const createTimeout = () => {
        setTimeout(() => {
            i++;
            createTimeout();
        }, 100);
    }
    createTimeout();

    // Still play the game normally
    if (api.isFirstInRound()) {
        return api.roll();
    }

    const prevScore = api.getPreviousAction();
    const currentScore = api.roll();
    
    if (prevScore === null || currentScore >= prevScore) {
        return;
    }
    api.lie(prevScore);
}
