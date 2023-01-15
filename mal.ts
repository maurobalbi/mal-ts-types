type input = "123"

type output = Repl<input>

type Read<T> = T;

type Eval<T> = T;

type Print <T> = T;

type Repl<T> = Print<Eval<Read<T>>>;