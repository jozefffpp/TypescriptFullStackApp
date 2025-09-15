module.exports = {
	displayName: 'angular',
	preset: 'jest-preset-angular',
	setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
	roots: ['<rootDir>'],
	transform: {
    	'^.+\\.tsx?$': [
     		'jest-preset-angular',
       		{ tsconfig: '<rootDir>/../tsconfig.spec.json',}
     	]
	},
	testMatch: [ "<rootDir>/**/?(*.)+(spec).[jt]s?(x)" ],
}
