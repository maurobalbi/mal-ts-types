type input = "{}"

type output = Parse<input>

type Read<T> = T;

type Eval<T> = T;

type Print <T> = T;

type Repl<T> = Print<Eval<Read<T>>>;

interface Token {
  typ: "LCurly" | "RCurly" | "LBracket" | "RBracket" | "String" | "Comma" | "Colon" | "Keyword" | "Number"
  inner?: string
}

type Pure<T> = T extends object ? {
  [P in keyof T] : Pure<T[P]>
} : T

type Alpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type TakeString<T extends string, S extends string = ''> = T extends `${infer P}${infer E}` ? (
  P extends '\\' ? (
    E extends `${infer R}${infer F}` ? (
      R extends '"' ? (
        TakeString<F, `${S}\"`>
      ) : (
        R extends '\\' ? (
          TakeString<F, `${S}\\`>
        ) : (
          R extends '/' ? (
            TakeString<F, `${S}/`>
          ) : (
            R extends 'b' ? (
              TakeString<F, `${S}\b`>
            ) : (
              R extends 'f' ? (
                TakeString<F, `${S}\f`>
              ) : (
                R extends 'n' ? (
                  TakeString<F, `${S}\n`>
                ) : (
                  R extends 'r' ? (
                    TakeString<F, `${S}\r`>
                  ) : (
                    R extends 't' ? (
                      TakeString<F, `${S}\t`>
                    ) : 0
                  )
                )
              )
            ) 
          )
        )
      )
    ) : never
  ) : (
    P extends '"' ? (
      [{typ: "String", inner: S}, E]
    ) : (
      P extends '\n' ? (
        never
      ) : (
        TakeString<E, `${S}${P}`>
      )
    )
  )
) : never

type TakeKeyword<T, S extends string = ''> = T extends `${infer P}${infer E}` ? (
  P extends Alpha ? (
    TakeKeyword<E, `${S}${P}`>
  ) : (
    S extends '' ? (
      never
    ) : (
      [{typ: "Keyword", inner: S}, T]
    )
  )
) : (
  S extends '' ? (
    never
  ) : (
    [{typ: "Keyword", inner: S}, T]
  )
)

type Tokenize<T extends string, S extends Token[] = []> = T extends `${infer P}${infer E}` ? (
  P extends '\r' | '\t' | ' ' | '\n' ? (
    Tokenize<E, S>
  ) : (
    (
      P extends '{' ? (
        Tokenize<E, [...S, { typ: "LCurly" }]>
      ) : (
        P extends '}' ? (
          Tokenize<E, [...S, { typ: "RCurly" }]>
        ) : (
          P extends '[' ? (
            Tokenize<E, [...S, { typ: "LBracket" }]>
          ) : (
            P extends ']' ? (
              Tokenize<E, [...S, { typ: "RBracket" }]>
            ) : (
              P extends ',' ? (
                Tokenize<E, [...S, { typ: "Comma" }]>
              ) : (
                P extends ':' ? (
                  Tokenize<E, [...S, { typ: "Colon" }]>
                ) : (
                  P extends '"' ? (
                    TakeString<E> extends [Token, string] ? (
                      Tokenize<TakeString<E>[1], [...S, TakeString<E>[0]]>
                    ) : never
                  ) : (
                    P extends Alpha ? (
                      TakeKeyword<T> extends [Token, string] ? (
                        Tokenize<TakeKeyword<T>[1], [...S, TakeKeyword<T>[0]]>
                      ) : never
                    ) : (
                      never
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
) : S

type SetProperty<T , K extends PropertyKey, V> = {
  [P in (keyof T) | K]: P extends K ? V : P extends keyof T ? T[P] : never
}

type ParseRecordImpl<T extends Token[], S = {}> = (
  ParsePair<T> extends never ? (
    never
  ) : (
    TakeToken<ParsePair<T>[1]> extends never ? (
      never
    ) : (
      TakeToken<ParsePair<T>[1]>[0]['typ'] extends 'RCurly' ? (
        [SetProperty<S, ParsePair<T>[0][0], ParsePair<T>[0][1]>, TakeToken<ParsePair<T>[1]>[1]]
      ) : (
        TakeToken<ParsePair<T>[1]>[0]['typ'] extends 'Comma' ? (
          ParseRecordImpl<TakeToken<ParsePair<T>[1]>[1], SetProperty<S, ParsePair<T>[0][0], ParsePair<T>[0][1]>>
        ) : never
      )
    )
  )
)

type ParseRecord<T extends Token[]> = T extends [infer P, ...(infer E)] ? (
  P extends Token ? (
    E extends Token[] ? (
      P['typ'] extends 'RCurly' ? (
        [{}, E]
      ) : ParseRecordImpl<T, {}>
    ) : never
  ) : never
) : never



type ParsePair<T extends Token[]> = ParseString<T> extends never ? (
  ParseString<T>
) : (
  TakeToken<ParseString<T>[1]> extends never ? (
    never
  ) : (
    TakeToken<ParseString<T>[1]>[0]['typ'] extends 'Colon' ? (
      ParseLiteral<TakeToken<ParseString<T>[1]>[1]> extends never ? (
        never
      ) : (
        [
          [ParseString<T>[0], ParseLiteral<TakeToken<ParseString<T>[1]>[1]>[0]],
          ParseLiteral<TakeToken<ParseString<T>[1]>[1]>[1]
        ]
      )
    ) : never
  )
)

type TakeToken<T extends Token[]> = T extends [infer P, ...(infer S)] ? (
  [P, S] extends [Token, Token[]] ? ( 
    [P, S]
  ) : never
) : never

type ParseArrayImpl<T extends Token[], S extends unknown[] = []> = (
  ParseLiteral<T> extends never ? (
    never
  ) : (
    TakeToken<ParseLiteral<T>[1]> extends never ? (
      never
    ) : (
      TakeToken<ParseLiteral<T>[1]>[0]['typ'] extends 'Comma' ? (
        ParseArrayImpl<TakeToken<ParseLiteral<T>[1]>[1], [...S, ParseLiteral<T>[0]]>
      ) : (
        TakeToken<ParseLiteral<T>[1]>[0]['typ'] extends 'RBracket' ? (
          [[...S, ParseLiteral<T>[0]], TakeToken<ParseLiteral<T>[1]>[1]]
        ) : never
      )
    )
  )
)

type ParseArray<T extends Token[]> = (
  T extends [infer P, ...(infer E)] ? (
    [P, E] extends [Token, Token[]] ? ( 
        [P, E][0]['typ'] extends 'RBracket' ? (
          [[], E]
        ) : ParseArrayImpl<T, []>
    ) : never
  ) : never
)

type ParseKeyword<T extends Token[]> = (
  TakeToken<T> extends never ? never : (
    TakeToken<T>[0]['typ'] extends 'Keyword' ? (
      Exclude<TakeToken<T>[0]['inner'], undefined> extends 'true' ? (
        [true, TakeToken<T>[1]]
      ) : (
        Exclude<TakeToken<T>[0]['inner'], undefined> extends 'false' ? (
          [false, TakeToken<T>[1]]
        ) : (
          Exclude<TakeToken<T>[0]['inner'], undefined> extends 'null' ? (
            [null, TakeToken<T>[1]]
          ) : never
        )
      )
    ) : never
  )
)

type ParseString<T extends Token[]> = (
  TakeToken<T> extends never ? never : (
    TakeToken<T>[0]['typ'] extends 'String' ? (
      [Exclude<TakeToken<T>[0]['inner'], undefined>, TakeToken<T>[1]]
    ) : never
  )
)


type ParseNumber<T extends Token[]> = (
  TakeToken<T> extends never ? never : (
    TakeToken<T>[0]['typ'] extends 'Number' ? (
      TakeToken<T>[0]
    ) : never
  )
)

type ParseRoot<T extends Token[]> = (
  TakeToken<T> extends never ? never : (
    TakeToken<T>[0]['typ'] extends 'LCurly' ? (
      ParseRecord<TakeToken<T>[1]>
    ) : (
      TakeToken<T>[0]['typ'] extends 'LBracket' ? (
        ParseArray<TakeToken<T>[1]>
      ) : never
    )
  )
)


type ParseLiteral<T extends Token[]> = (
  | ParseRoot<T>
  | ParseString<T>
  | ParseKeyword<T>
  | ParseNumber<T>
)

//
// support data types:
//  - `boolean` (`true` `false`)
//  - `string` (`"\\r\\n"`)
//  - `object` & `array`
//  - `null` (`null`)
//
type Parse<T extends string> = Pure<ParseLiteral<Tokenize<T>>[0]>