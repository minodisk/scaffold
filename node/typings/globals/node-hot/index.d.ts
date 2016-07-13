interface Hot {
  accept(): void;
}

interface NodeModule {
  hot: Hot;
}
