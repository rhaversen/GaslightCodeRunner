// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express';
import { CodeRunnerService } from '../services/CodeRunnerService';

// Own modules

// Environment variables

// Config variables

// Destructuring and global variables

const codeRunner = new CodeRunnerService();

export async function gradeSubmission(req: Request, res: Response) {
    const { code, language } = req.body;

    if (!code || !language || typeof code !== 'string' || typeof language !== 'string') {
        return res.status(400).json({ error: 'Invalid input parameters' });
    }

    if (!codeRunner.isLanguageSupported(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    try {
        const result = await codeRunner.executeCode(language, code);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' });
    }
}
