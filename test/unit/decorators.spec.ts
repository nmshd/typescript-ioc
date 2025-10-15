import { IoCContainer } from '../../src/container/container';
import { InjectValue, OnlyInstantiableByContainer } from '../../src/decorators';
import { Config, Factory, Inject, Scope, Scoped, Singleton } from '../../src/typescript-ioc';

jest.mock('../../src/container/container');
const mockInjectProperty = IoCContainer.injectProperty as jest.Mock;
const mockBind = IoCContainer.bind as jest.Mock;

describe('@Inject decorator', () => {
    beforeEach(() => {
        mockInjectProperty.mockClear();
        mockBind.mockClear();
    });

    it('should inject a new value on the property field', () => {
        class SimppleInject {
            @Inject public dateProperty: Date;
        }
        expect(mockInjectProperty).toHaveBeenCalledWith(SimppleInject, 'dateProperty', Date);
    });

    it('should inject new values on constructor parameters', () => {
        const config: any = {};
        mockBind.mockReturnValue(config);

        class ConstructorInjected {
            constructor(
                @Inject public anotherDate: Date,
                @Inject public myProp: String
            ) {}
        }
        expect(mockBind).toHaveBeenCalledWith(ConstructorInjected);
        expect(config.paramTypes).toStrictEqual([Date, String]);
    });

    it('should not inject values in non constructor methods', () => {
        class MethodInjected {
            public myMethod(@Inject _anotherDate: Date) {
                //
            }
        }

        expect(mockBind).not.toHaveBeenCalledWith(MethodInjected);
    });

    it('can not be used on classes directly', () => {
        const testFunction = () => {
            @Inject
            class ClassInjected {}
            expect(mockBind).not.toHaveBeenCalledWith(ClassInjected);
        };

        expect(testFunction).toThrow(new TypeError('Invalid @Inject Decorator declaration.'));
    });
});

const mockInjectValueProperty = IoCContainer.injectValueProperty as jest.Mock;
const mockBindName = IoCContainer.bindName as jest.Mock;

describe('@InjectValue decorator', () => {
    beforeEach(() => {
        mockInjectValueProperty.mockClear();
        mockBindName.mockClear();
        mockBind.mockClear();
    });

    it('should inject a new value on the property field', () => {
        class SimppleInject {
            @InjectValue('myDate') public dateProperty: Date;
        }
        expect(mockInjectValueProperty).toHaveBeenCalledWith(SimppleInject, 'dateProperty', 'myDate');
    });

    it('should inject new values on constructor parameters', () => {
        const config: any = {};
        mockBind.mockReturnValue(config);

        class ConstructorInjected {
            constructor(
                @InjectValue('myDate') public anotherDate: Date,
                @Inject public myProp: String
            ) {}
        }
        expect(mockBind).toHaveBeenCalledWith(ConstructorInjected);
        expect(config.paramTypes).toStrictEqual(['myDate', String]);
    });

    it('should not inject values in non constructor methods', () => {
        class MethodInjected {
            public myMethod(@InjectValue('myDate') _anotherDate: Date) {
                //
            }
        }

        expect(mockBind).not.toHaveBeenCalledWith(MethodInjected);
    });

    it('can not be used on classes directly', () => {
        const testFunction = () => {
            @InjectValue('myDate')
            class ClassInjected {}
            expect(mockBind).not.toHaveBeenCalledWith(ClassInjected);
        };

        expect(testFunction).toThrow(new TypeError('Invalid @InjectValue Decorator declaration.'));
    });
});

const mockTo = jest.fn();
const mockInstrumentConstructor = jest.fn();
const mockFactory = jest.fn();
const mockScope = jest.fn();
const mockWithParams = jest.fn();
const bindResult: Config = {
    to: mockTo,
    factory: mockFactory,
    scope: mockScope,
    withParams: mockWithParams
};

describe('@Singleton decorator', () => {
    beforeEach(() => {
        mockBind.mockClear();
        mockScope.mockClear();
        mockBind.mockReturnValue(bindResult);
        mockScope.mockReturnValue(bindResult);
    });

    it('should configure the class binding into a singleton scope', () => {
        @Singleton
        class SingletonInject {}
        expect(mockBind).toHaveBeenCalledWith(SingletonInject);
        expect(mockScope).toHaveBeenCalledWith(Scope.Singleton);
    });
});

describe('@Scoped decorator', () => {
    beforeEach(() => {
        mockBind.mockClear();
        mockScope.mockClear();
        mockBind.mockReturnValue(bindResult);
        mockScope.mockReturnValue(bindResult);
    });

    it('should configure the class binding into a custom scope', () => {
        @Scoped(Scope.Local)
        class ScopedInject {}
        expect(mockBind).toHaveBeenCalledWith(ScopedInject);
        expect(mockScope).toHaveBeenCalledWith(Scope.Local);
    });
});

describe('@Factory decorator', () => {
    beforeEach(() => {
        mockBind.mockClear();
        mockFactory.mockClear();
        mockBind.mockReturnValue(bindResult);
        mockFactory.mockReturnValue(bindResult);
    });

    it('should configure the class binding to use a custom provider', () => {
        const factory = () => new ProvidedInject();
        @Factory(factory)
        class ProvidedInject {}
        expect(mockBind).toHaveBeenCalledWith(ProvidedInject);
        expect(mockFactory).toHaveBeenCalledWith(factory);
    });
});

describe('@OnlyInstantiableByContainer decorator', () => {
    beforeEach(() => {
        mockBind.mockClear();
        mockInstrumentConstructor.mockReturnThis();
    });

    it('should make the instantiation of a class only possible through the IoC Container', () => {
        const constructor = { a: 'constructor' };
        const bind = {
            instrumentConstructor: mockInstrumentConstructor,
            decoratedConstructor: constructor
        };
        mockBind.mockReturnValue(bind);
        class WiredInject {}

        expect(OnlyInstantiableByContainer(WiredInject)).toEqual(constructor);
        expect(mockBind).toHaveBeenCalledWith(WiredInject);
        expect(mockInstrumentConstructor).toHaveBeenCalled();
    });
});
