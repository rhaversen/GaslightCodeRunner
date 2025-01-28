// Node.js built-in modules
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Third-party libraries
import { Logtail } from '@logtail/node'
import { createLogger, format as _format, transports as _transports } from 'winston'
import { TransformableInfo } from 'logform'

// Own modules

// Environment variables

// Config variables

// Destructuring and global variables
const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)
const logDirectory = join(_dirname, (['production', 'staging'].includes(process.env.NODE_ENV ?? '') ? './logs/' : '../../logs/'))
const logLevel = {
	development: 'silly',
	production: 'info',
	staging: 'info',
	test: 'debug'
}

type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'
interface WinstonLogObject extends TransformableInfo {
	timestamp?: string;
	level: string;
	message: string;
	service?: string;
	[key: string]: unknown;
}
interface LogMetadata {
	[key: string]: unknown;
}

// Create a reusable format configuration
const defaultServiceName = 'gaslight-backend'

const logFormat = _format.printf((info: TransformableInfo) => {
	const logObject = info as WinstonLogObject
	const { timestamp, level, message, service, ...restMetadata } = logObject

	// Only include metadata if there are non-default values
	const cleanMetadata = { ...restMetadata }
	if (service !== defaultServiceName) {
		cleanMetadata.service = service
	}

	const metadataStr = Object.keys(cleanMetadata).length > 0
		? `\n${JSON.stringify(cleanMetadata, null, 2)}`
		: ''

	return `${timestamp ?? new Date().toISOString()} ${level}: ${message}${metadataStr}`
})

const winstonLogger = createLogger({
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		verbose: 4,
		debug: 5,
		silly: 6
	},
	format: _format.combine(
		_format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
		_format.json(), // Use JSON format for logs
		logFormat
	),
	defaultMeta: { service: defaultServiceName }, // Set a default metadata field
	transports: [
		new _transports.File({
			filename: join(logDirectory, '../../logs/error.log'),
			level: 'error'
		}),
		new _transports.File({
			filename: join(logDirectory, '../../logs/info.log'),
			level: 'info'
		}),
		new _transports.File({
			filename: join(logDirectory, '../../logs/combined.log'),
			level: 'silly'
		}),
		new _transports.Console({
			format: _format.combine(
				_format.colorize(),
				_format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
				logFormat
			),
			level: logLevel[process.env.NODE_ENV as keyof typeof logLevel]
		})
	]
})

// Instantiate betterStackLogger only in production
let betterStackLogger: Logtail | null = null

function stringifyMessage(message: unknown): string {
	if (typeof message === 'string') {
		return message
	}
	if (message instanceof Error) {
		return message.toString()
	}
	try {
		return JSON.stringify(message, null, 2)
	} catch {
		return String(message)
	}
}

function logToWinston(level: LogLevel, message: string, metadata: LogMetadata = {}): void {
	switch (level) {
		case 'error':
			winstonLogger.error(message, metadata)
			break
		case 'warn':
			winstonLogger.warn(message, metadata)
			break
		case 'info':
			winstonLogger.info(message, metadata)
			break
		case 'http':
			winstonLogger.http(message, metadata)
			break
		case 'verbose':
			winstonLogger.verbose(message, metadata)
			break
		case 'debug':
			winstonLogger.debug(message, metadata)
			break
		case 'silly':
			winstonLogger.silly(message, metadata)
			break
	}
}

async function logToBetterStack(level: LogLevel, message: string, metadata: LogMetadata = {}): Promise<void> {
	if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
		return
	}

	if (betterStackLogger === null || betterStackLogger === undefined) {
		betterStackLogger = new Logtail(process.env.BETTERSTACK_LOG_TOKEN ?? '')
	}

	const fullMessage = Object.keys(metadata).length > 0
		? `${message} ${JSON.stringify(metadata)}`
		: message

	switch (level) {
		case 'error':
			await betterStackLogger.error(fullMessage)
			break
		case 'warn':
			await betterStackLogger.warn(fullMessage)
			break
		case 'info':
			await betterStackLogger.info(fullMessage)
			break
		default:
			await betterStackLogger.debug(fullMessage)
	}
}

function log (level: LogLevel, ...messages: unknown[]): void {
	// Check if last argument is metadata object
	const lastArg = messages[messages.length - 1]
	const hasMetadata = typeof lastArg === 'object' && lastArg !== null && !Array.isArray(lastArg)

	const metadata = hasMetadata ? messages.pop() : {}
	const message = messages.map(msg => {
		if (typeof msg === 'string') {
			return msg
		}
		return stringifyMessage(msg)
	}).join(' ')

	logToWinston(level, message, metadata as LogMetadata)
	logToBetterStack(level, message, metadata as LogMetadata)
		.catch((error) => {
			logToWinston('error', `Error logging to BetterStack: ${error instanceof Error ? error.toString() : String(error)}`)
		})
}

const logger = {
	error: (...messages: unknown[]) => {
		log('error', ...messages)
	},
	warn: (...messages: unknown[]) => {
		log('warn', ...messages)
	},
	info: (...messages: unknown[]) => {
		log('info', ...messages)
	},
	http: (...messages: unknown[]) => {
		log('http', ...messages)
	},
	verbose: (...messages: unknown[]) => {
		log('verbose', ...messages)
	},
	debug: (...messages: unknown[]) => {
		log('debug', ...messages)
	},
	silly: (...messages: unknown[]) => {
		log('silly', ...messages)
	}
}

export default logger
