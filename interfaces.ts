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

  class BooleanType extends BasicType<boolean> {}

  class IntegerType extends BasicType<number> {
    validate(): ValidationError<any>[] {
      if (this.value !== (this.value >> 0)) {
        return [
          new IntegerValidationError(this.value)
        ]
      }
    }
  }

  class StringType extends BasicType<string> {}

  class Circle implements IValidatable {
    static fromJSON(j: string): Circle {
      return new Circle(JSON.parse(j));
    }

    private _name: CircleName;
    get name(): string {
      return this._name.value;
    }
    set name(v: string) {
      this._name.value = v;
    }

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _description: CircleDescription;
    get description(): string {
      return this._description.value;
    }
    set description(v: string) {
      this._description.value = v;
    }

    private _id: ID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    private _isPrivate: IsPrivate;
    get isPrivate(): boolean {
      return this._isPrivate.value;
    }
    set isPrivate(v: boolean) {
      this._isPrivate.value = v;
    }

    constructor(o: any) {
      this._name = new CircleName(o.name);
      this._updatedAt = new UpdatedAt(o.updated_at);
      this._createdAt = new CreatedAt(o.created_at);
      this._description = new CircleDescription(o.description);
      this._id = new ID(o.id);
      this._isPrivate = new IsPrivate(o.is_private);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._name.validate(),
        this._updatedAt.validate(),
        this._createdAt.validate(),
        this._description.validate(),
        this._id.validate(),
        this._isPrivate.validate()
      ]);
    }

    toJSON(): Object {
      return {
        name: this._name,
        updated_at: this._updatedAt,
        created_at: this._createdAt,
        description: this._description,
        id: this._id,
        is_private: this._isPrivate
      };
    }
  }

  class Event implements IValidatable {
    static fromJSON(j: string): Event {
      return new Event(JSON.parse(j));
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _description: EventDescription;
    get description(): string {
      return this._description.value;
    }
    set description(v: string) {
      this._description.value = v;
    }

    private _finishedAt: EventStartedAt;
    get finishedAt(): string {
      return this._finishedAt.value;
    }
    set finishedAt(v: string) {
      this._finishedAt.value = v;
    }

    private _id: ID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    private _startedAt: EventStartedAt;
    get startedAt(): string {
      return this._startedAt.value;
    }
    set startedAt(v: string) {
      this._startedAt.value = v;
    }

    private _title: EventTitle;
    get title(): string {
      return this._title.value;
    }
    set title(v: string) {
      this._title.value = v;
    }

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    private _closedAt: EventClosedAt;
    get closedAt(): string {
      return this._closedAt.value;
    }
    set closedAt(v: string) {
      this._closedAt.value = v;
    }

    constructor(o: any) {
      this._createdAt = new CreatedAt(o.created_at);
      this._description = new EventDescription(o.description);
      this._finishedAt = new EventStartedAt(o.finished_at);
      this._id = new ID(o.id);
      this._startedAt = new EventStartedAt(o.started_at);
      this._title = new EventTitle(o.title);
      this._updatedAt = new UpdatedAt(o.updated_at);
      this._closedAt = new EventClosedAt(o.closed_at);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._createdAt.validate(),
        this._description.validate(),
        this._finishedAt.validate(),
        this._id.validate(),
        this._startedAt.validate(),
        this._title.validate(),
        this._updatedAt.validate(),
        this._closedAt.validate()
      ]);
    }

    toJSON(): Object {
      return {
        created_at: this._createdAt,
        description: this._description,
        finished_at: this._finishedAt,
        id: this._id,
        started_at: this._startedAt,
        title: this._title,
        updated_at: this._updatedAt,
        closed_at: this._closedAt
      };
    }
  }

  class Medium implements IValidatable {
    static fromJSON(j: string): Medium {
      return new Medium(JSON.parse(j));
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _id: ID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    private _url: ImageURL;
    get url(): string {
      return this._url.value;
    }
    set url(v: string) {
      this._url.value = v;
    }

    constructor(o: any) {
      this._createdAt = new CreatedAt(o.created_at);
      this._id = new ID(o.id);
      this._updatedAt = new UpdatedAt(o.updated_at);
      this._url = new ImageURL(o.url);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._createdAt.validate(),
        this._id.validate(),
        this._updatedAt.validate(),
        this._url.validate()
      ]);
    }

    toJSON(): Object {
      return {
        created_at: this._createdAt,
        id: this._id,
        updated_at: this._updatedAt,
        url: this._url
      };
    }
  }

  class Post implements IValidatable {
    static fromJSON(j: string): Post {
      return new Post(JSON.parse(j));
    }

    private _body: PostBody;
    get body(): string {
      return this._body.value;
    }
    set body(v: string) {
      this._body.value = v;
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _id: ID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    public media: Media;

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    public author: User;

    constructor(o: any) {
      this._body = new PostBody(o.body);
      this._createdAt = new CreatedAt(o.created_at);
      this._id = new ID(o.id);
      this.media = new Media(o.media);
      this._updatedAt = new UpdatedAt(o.updated_at);
      this.author = new User(o.author);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._body.validate(),
        this._createdAt.validate(),
        this._id.validate(),
        this.media.validate(),
        this._updatedAt.validate(),
        this.author.validate()
      ]);
    }

    toJSON(): Object {
      return {
        body: this._body,
        created_at: this._createdAt,
        id: this._id,
        media: this.media,
        updated_at: this._updatedAt,
        author: this.author
      };
    }
  }

  class Profile implements IValidatable {
    static fromJSON(j: string): Profile {
      return new Profile(JSON.parse(j));
    }

    private _circleId: CircleID;
    get circleId(): number {
      return this._circleId.value;
    }
    set circleId(v: number) {
      this._circleId.value = v;
    }

    private _firstName: FirstName;
    get firstName(): string {
      return this._firstName.value;
    }
    set firstName(v: string) {
      this._firstName.value = v;
    }

    private _gender: Gender;
    get gender(): string {
      return this._gender.value;
    }
    set gender(v: string) {
      this._gender.value = v;
    }

    private _id: ID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    private _lastName: LastName;
    get lastName(): string {
      return this._lastName.value;
    }
    set lastName(v: string) {
      this._lastName.value = v;
    }

    private _nickname: Nickname;
    get nickname(): string {
      return this._nickname.value;
    }
    set nickname(v: string) {
      this._nickname.value = v;
    }

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    private _birthday: Birthday;
    get birthday(): string {
      return this._birthday.value;
    }
    set birthday(v: string) {
      this._birthday.value = v;
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _userId: UserID;
    get userId(): number {
      return this._userId.value;
    }
    set userId(v: number) {
      this._userId.value = v;
    }

    constructor(o: any) {
      this._circleId = new CircleID(o.circle_id);
      this._firstName = new FirstName(o.first_name);
      this._gender = new Gender(o.gender);
      this._id = new ID(o.id);
      this._lastName = new LastName(o.last_name);
      this._nickname = new Nickname(o.nickname);
      this._updatedAt = new UpdatedAt(o.updated_at);
      this._birthday = new Birthday(o.birthday);
      this._createdAt = new CreatedAt(o.created_at);
      this._userId = new UserID(o.user_id);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._circleId.validate(),
        this._firstName.validate(),
        this._gender.validate(),
        this._id.validate(),
        this._lastName.validate(),
        this._nickname.validate(),
        this._updatedAt.validate(),
        this._birthday.validate(),
        this._createdAt.validate(),
        this._userId.validate()
      ]);
    }

    toJSON(): Object {
      return {
        circle_id: this._circleId,
        first_name: this._firstName,
        gender: this._gender,
        id: this._id,
        last_name: this._lastName,
        nickname: this._nickname,
        updated_at: this._updatedAt,
        birthday: this._birthday,
        created_at: this._createdAt,
        user_id: this._userId
      };
    }
  }

  class Session implements IValidatable {
    static fromJSON(j: string): Session {
      return new Session(JSON.parse(j));
    }

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _id: UserID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    private _token: Token;
    get token(): string {
      return this._token.value;
    }
    set token(v: string) {
      this._token.value = v;
    }

    constructor(o: any) {
      this._updatedAt = new UpdatedAt(o.updated_at);
      this._createdAt = new CreatedAt(o.created_at);
      this._id = new UserID(o.id);
      this._token = new Token(o.token);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._updatedAt.validate(),
        this._createdAt.validate(),
        this._id.validate(),
        this._token.validate()
      ]);
    }

    toJSON(): Object {
      return {
        updated_at: this._updatedAt,
        created_at: this._createdAt,
        id: this._id,
        token: this._token
      };
    }
  }

  class User implements IValidatable {
    static fromJSON(j: string): User {
      return new User(JSON.parse(j));
    }

    private _updatedAt: UpdatedAt;
    get updatedAt(): string {
      return this._updatedAt.value;
    }
    set updatedAt(v: string) {
      this._updatedAt.value = v;
    }

    private _createdAt: CreatedAt;
    get createdAt(): string {
      return this._createdAt.value;
    }
    set createdAt(v: string) {
      this._createdAt.value = v;
    }

    private _email: Email;
    get email(): string {
      return this._email.value;
    }
    set email(v: string) {
      this._email.value = v;
    }

    private _id: UserID;
    get id(): number {
      return this._id.value;
    }
    set id(v: number) {
      this._id.value = v;
    }

    constructor(o: any) {
      this._updatedAt = new UpdatedAt(o.updated_at);
      this._createdAt = new CreatedAt(o.created_at);
      this._email = new Email(o.email);
      this._id = new UserID(o.id);
    }

    validate(): ValidationError<any>[] {
      return flatten([
        this._updatedAt.validate(),
        this._createdAt.validate(),
        this._email.validate(),
        this._id.validate()
      ]);
    }

    toJSON(): Object {
      return {
        updated_at: this._updatedAt,
        created_at: this._createdAt,
        email: this._email,
        id: this._id
      };
    }
  }


  class Circles extends Array<Circle> implements IValidatable {
    static fromJSON(j: string): Circles {
      return new Circles(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: Circle) => el.validate())
        .filter(notNully));
    }
  }

  class Events extends Array<Event> implements IValidatable {
    static fromJSON(j: string): Events {
      return new Events(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: Event) => el.validate())
        .filter(notNully));
    }
  }

  class Media extends Array<Medium> implements IValidatable {
    static fromJSON(j: string): Media {
      return new Media(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: Medium) => el.validate())
        .filter(notNully));
    }
  }

  class Posts extends Array<Post> implements IValidatable {
    static fromJSON(j: string): Posts {
      return new Posts(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: Post) => el.validate())
        .filter(notNully));
    }
  }

  class Profiles extends Array<Profile> implements IValidatable {
    static fromJSON(j: string): Profiles {
      return new Profiles(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: Profile) => el.validate())
        .filter(notNully));
    }
  }

  class Users extends Array<User> implements IValidatable {
    static fromJSON(j: string): Users {
      return new Users(JSON.parse(j));
    }

    constructor(a: any[]) {
      super(...a);
    }

    validate(): ValidationError<any>[] {
      return flatten(this.map((el: User) => el.validate())
        .filter(notNully));
    }
  }


  class IsPrivate extends BooleanType {
    validators: Validator<boolean, any>[] = [];
  }


  class CircleID extends IntegerType {
    validators: Validator<number, any>[] = [];
  }

  class ID extends IntegerType {
    validators: Validator<number, any>[] = [];
  }

  class UserID extends IntegerType {
    validators: Validator<number, any>[] = [];
  }



  class Birthday extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class CircleDescription extends StringType {
    validators: Validator<string, any>[] = [
      new MinLengthValidator(1000)
    ];
  }

  class CircleName extends StringType {
    validators: Validator<string, any>[] = [
      new MinLengthValidator(255)
    ];
  }

  class CreatedAt extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class Email extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class EventClosedAt extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class EventFinishedAt extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class EventStartedAt extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class EventDescription extends StringType {
    validators: Validator<string, any>[] = [
      new MinLengthValidator(1000)
    ];
  }

  class EventTitle extends StringType {
    validators: Validator<string, any>[] = [
      new MinLengthValidator(255)
    ];
  }

  class FirstName extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class Gender extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class ImageURL extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class LastName extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class Nickname extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class Password extends StringType {
    validators: Validator<string, any>[] = [
      new MinLengthValidator(8),
      new MinLengthValidator(255)
    ];
  }

  class PostBody extends StringType {
    validators: Validator<string, any>[] = [
      new MinLengthValidator(1000)
    ];
  }

  class Token extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class URL extends StringType {
    validators: Validator<string, any>[] = [];
  }

  class UpdatedAt extends StringType {
    validators: Validator<string, any>[] = [];
  }

}
