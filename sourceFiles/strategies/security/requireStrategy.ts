import { MeyerStrategyAPI } from '../../meyer/types.ts'

export default function (api: MeyerStrategyAPI) {
    try {
        // Attempt to access filesystem
        // @ts-ignore
        require('fs').readFileSync('/etc/passwd');
    } catch (e) {
        console.log('Failed to access filesystem');
    }

    try {
        // Attempt to access process
        // @ts-ignore
        process.exit(1);
    } catch (e) {
        console.log('Failed to exit process');
    }

    // Fall back to normal play if security breaches fail
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
