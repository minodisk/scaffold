namespace interfaces {
  function flatten<T>(a: T[][]): T[] {
    return Array.prototype.concat.apply([], a);
  }

  function notNully<T>(x: T): boolean {
    return x != null;
  }

  class Validator<T, U> {
    expected: U;

    constructor(expected: U) {
      this.expected = expected;
    }

    validate(value: T): ValidationError<U> {
      return null;
    }
  }

  class MinLengthValidator extends Validator<string, number> {
    validate(value: string): MinLengthValidationError {
      if (value.length < this.expected) {
        return new MinLengthValidationError(value.length);
      }
    }
  }

  class MaxLengthValidator extends Validator<string, number> {
    validate(value: string): MinLengthValidationError {
      if (value.length > this.expected) {
        return new MaxLengthValidationError(value.length);
      }
    }
  }

  class MinimumValidator extends Validator<number, number> {
    validate(value: number): MinimumValidationError {
      if (value < this.expected) {
        return new MinimumValidationError(value);
      }
    }
  }

  class MaximumValidator extends Validator<number, number> {
    validate(value: number): MaximumValidationError {
      if (value > this.expected) {
        return new MaximumValidationError(value);
      }
    }
  }

  class FormatValidator extends Validator<string, RegExp> {
    validate(value: string): FormatValidationError {
      if (!this.expected.test(value)) {
        return new FormatValidationError();
      }
    }
  }

  class DatetimeValidator extends FormatValidator {
    regExp:RegExp = /^\d{4,}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])[tT ](?:[01][0-9]|2[0-4]):[0-5][0-9]:[0-5][0-9](\.\d+)?(?:[zZ]|(?:+(?:0[0-9]|1[0-4])|-(?:0[0-9]|1[0-2]))(?::[0-5][0-9])?)$/
  }

  class EmailValidator extends FormatValidator {
    regExp:RegExp = /^.+@.+\..+$/;
  }


  class HostnameValidator extends FormatValidator {
    regExp:RegExp = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/;
  }

  // stolen from golang.org/src/net/ip.go
  function isIPV4(s: string): boolean {
    let i: number = 0;
    let len: number = s.length;
    for (let j: number = 0; j < IPv4len; j++) {
      if (i >= len) {
        // Missing octets.
        return false;
      }
      if (j > 0) {
        if (s[i] != '.') {
          return false;
        }
        i++;
      }
      let res = dtoi(s, i);
      if (!res.ok || res.n > 0xFF) {
        return false;
      }
      i = res.i;
    }
    if (i != len) {
      return false;
    }
    return true;
  }

  const IPv4len: number = 4;
  const IPv6len: number = 16;
  const big: number = 0xFFFFFF;

  // Decimal to integer starting at &s[i0].
  // Returns number, new offset, success.
  // stolen from golang.org/src/net/parse.go
  function dtoi(s: string, i0: number): {n: number, i: number, ok: boolean} {
    let n: number = 0;
    let neg: boolean = false;
    let len: number = s.length;
    if (len > 0 && s[0] === '-') {
      neg = true;
      s = s.substr(1);
    }
    let i: number;
    for (i = i0; i < len && 48 <= s.charCodeAt(i) && s.charCodeAt(i) <= 57; i++) {
      n = n * 10 + parseInt(s[i], 10);
      if (n >= big) {
        if (neg) {
          return { n: -big, i: i + 1, ok: false };
        }
        return { n: big, i: i, ok: false};
      }
    }
    if (i == i0) {
      return { n: 0, i: i, ok: false };
    }
    if (neg) {
      n = -n;
      i++;
    }
    return { n: n, i: i, ok: true };
  }

  // stolen from src/net/dnsclient.go
  function isDomainName(s: string): boolean {
    // See RFC 1035, RFC 3696.
    const len: number = s.length;
    if (len == 0) {
      return false;
    }
    if (len > 255) {
      return false;
    }

    let last: string = '.';
    let ok: boolean = false; // Ok once we've seen a letter.
    let partlen: number = 0;
    for (let i: number = 0; i < len; i++) {
      let c = s.charCodeAt(i);
      switch (true) {
      default:
        return false;
      // a-zA-Z_
      case 97 <= c && c <= 122 || 65 <= c && c <= 90 || c == 95:
        ok = true;
        partlen++;
      // 0-9
      case 48 <= c && c <= 57:
        // fine
        partlen++;
      // '-'
      case c == 45:
        // Byte before dash cannot be dot.
        if (last == '.') {
          return false;
        }
        partlen++;
      // .
      case c == 46:
        // Byte before dot cannot be dot, dash.
        if (last == '.' || last == '-') {
          return false;
        }
        if (partlen > 63 || partlen == 0) {
          return false;
        }
        partlen = 0;
      }
      last = s.charAt(i);
    }

    if (last == '-' || partlen > 63) {
      return false;
    }

    return ok;
  }

  class IPV4Validator extends FormatValidator {
  // IPv4 address, according to dotted-quad ABNF syntax as defined in
  // http://tools.ietf.org/html/rfc2673#section-3.2
    regExp:RegExp = /^(?:(?:25[0-5]|2[0-4][0-9]|(?:1?[0-9])?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|(?:1?[0-9])?[0-9])$/;
  }

  class IPV6Validator extends FormatValidator {
    // IPv6 address, as defined in
    // http://tools.ietf.org/html/rfc2373#section-2.2
    regExp:RegExp = /^(?:[0-9a-f]+:){7}[0-9a-f]+$/
  }

  class URIValidator extends FormatValidator {
    regExp:RegExp = /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]*$/;
  }

  class ValidationError<T> {
    value: T;

    constructor(v: T) {
      this.value = v;
    }

    toString(): string {
      return `${this.value} is invalid`;
    }
  }

  class MinLengthValidationError extends ValidationError<number> {
    toString(): string {
      return `at least ${this.value} characters`;
    }
  }

  class MaxLengthValidationError extends ValidationError<number> {
    toString(): string {
      return `no more than ${this.value} characters`;
    }
  }

  class MinimumValidationError extends ValidationError<number> {
    toString(): string {
      return `at least ${this.value}`;
    }
  }

  class MaximumValidationError extends ValidationError<number> {
    toString(): string {
      return `no more than ${this.value}`;
    }
  }

  class PatternValidationError extends ValidationError<string> {
    toString(): string {
      return `Invalid pattern`;
    }
  }

  class IntegerValidationError extends ValidationError<number> {
    toString(): string {
      return `Invalid integer`;
    }
  }

  interface IValidatable {
    validate(): ValidationError<any>[];
  }

  class BasicType<T> implements IValidatable {
    value: T;
    validators: Validator<T, any>[];

    constructor(v: T) {
      this.value = v;
    }

    validate(): ValidationError<any>[] {
      return this.validators
        .map((v: Validator<T, any>): ValidationError<any> => v.validate(this.value))
        .filter(notNully)
    }

    toString(): string {
      return this.value.toString();
    }
  }

/*if .Booleans*/  class BooleanType extends BasicType<boolean> {}
/*end*/
/*if .Integers*/  class IntegerType extends BasicType<number> {
    validate(): ValidationError<any>[] {
      if (this.value !== (this.value >> 0)) {
        return [
          new IntegerValidationError(this.value)
        ]
      }
    }
  }/*end*/
/*if .Numbers*/  class NumberType extends BasicType<number> {}
/*end*/
/*if .Strings*/  class StringType extends BasicType<string> {}
/*end*/
/*range .Objects*/  class /*spaceToUpperCamelCase .Title*/ implements IValidatable {
    static fromJSON(j: string): /*spaceToUpperCamelCase .Title*/ {
      return new /*spaceToUpperCamelCase .Title*/(JSON.parse(j));
    }

/*range .Properties*/    /*if .IsPrivate*/private _/*snakeToLowerCamelCase .Key*/: /*spaceToUpperCamelCase .Title*/;
    get /*snakeToLowerCamelCase .Key*/(): /*.Type*/ {
      return this._/*snakeToLowerCamelCase .Key*/.value;
    }
    set /*snakeToLowerCamelCase .Key*/(v: /*.Type*/) {
      this._/*snakeToLowerCamelCase .Key*/.value = v;
    }/*else*/public /*snakeToLowerCamelCase .Key*/: /*spaceToUpperCamelCase .Title*/;/*end*/

/*end*/    constructor(o: any) {/*$len := len .Properties*//*range $i, $p := .Properties*/
      this./*if .IsPrivate*/_/*end*//*snakeToLowerCamelCase .Key*/ = new /*spaceToUpperCamelCase .Title*/(o./*.Key*/);/*if notLast $i $len*//*else*//*end*//*end*/
    }

    validate(): ValidationError<any>[] {
      return /*if .Properties*/flatten([/*$len := len .Properties*//*range $i, $p := .Properties*/
        this./*if .IsPrivate*/_/*end*//*snakeToLowerCamelCase .Key*/.validate()/*if notLast $i $len*/,/*else*/
      /*end*//*end*/])/*else*/[]/*end*/;
    }

    toJSON(): Object {
      return {/*$len := len .Properties*//*range $i, $p := .Properties*/
        /*.Key*/: this./*if .IsPrivate*/_/*end*//*snakeToLowerCamelCase .Key*//*if notLast $i $len*/,/*else*/
      /*end*//*end*/};
    }
  }

/*end*/
/*range .Arrays*/  class /*spaceToUpperCamelCase .Title*/ extends Array</*spaceToUpperCamelCase .Item.Title*/> implements IValidatable {
    static fromJSON(j: string): /*spaceToUpperCamelCase .Title*/ {
      return new /*spaceToUpperCamelCase .Title*/(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: /*spaceToUpperCamelCase .Item.Title*/) => el.validate())
        .filter(notNully));
    }
  }

/*end*/
/*range .Booleans*/  class /*spaceToUpperCamelCase .Title*/ extends BooleanType {
    validators: Validator<boolean, any>[] = [/*$len := len .Validations*//*range $i, $v := .Validations*/
      new /*.Func*/Validator(/*.Args*/)/*if notLast $i $len*/,/*else*/
    /*end*//*end*/];
  }

/*end*/
/*range .Integers*/  class /*spaceToUpperCamelCase .Title*/ extends IntegerType {
    validators: Validator<number, any>[] = [/*$len := len .Validations*//*range $i, $v := .Validations*/
      new /*.Func*/Validator(/*.Args*/)/*if notLast $i $len*/,/*else*/
    /*end*//*end*/];
  }

/*end*/
/*range .Numbers*/  class /*spaceToUpperCamelCase .Title*/ extends NumberType {
    validators: Validator<number, any>[] = [/*$len := len .Validations*//*range $i, $v := .Validations*/
      new /*.Func*/Validator(/*.Args*/)/*if notLast $i $len*/,/*else*/
    /*end*//*end*/];
  }

/*end*/
/*range .Strings*/  class /*spaceToUpperCamelCase .Title*/ extends StringType {
    validators: Validator<string, any>[] = [/*$len := len .Validations*//*range $i, $v := .Validations*/
      new /*.Func*/Validator(/*.Args*/)/*if notLast $i $len*/,/*else*/
    /*end*//*end*/];
  }

/*end*/}
