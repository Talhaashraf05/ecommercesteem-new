const NUM = /\d[\d,]*(?:\.\d+)?/g;

export interface ParsedCount {
  prefix: string;
  value: number;
  decimals: number;
  comma: boolean;
  suffix: string;
}

/** Splits a stat string around its single numeric token; null when there isn't exactly one. */
export const parseCount = (text: string): ParsedCount | null => {
  const matches = text.match(NUM);
  if (!matches || matches.length !== 1) return null;
  const token = matches[0];
  const i = text.indexOf(token);
  const decimals = token.includes(".") ? token.split(".")[1].length : 0;
  return {
    prefix: text.slice(0, i),
    value: Number(token.replace(/,/g, "")),
    decimals,
    comma: token.includes(","),
    suffix: text.slice(i + token.length),
  };
};

export const formatCount = (p: ParsedCount, v: number): string => {
  const n = Math.min(Math.max(v, 0), p.value);
  const body = p.comma
    ? n.toLocaleString("en-US", { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : n.toFixed(p.decimals);
  return `${p.prefix}${body}${p.suffix}`;
};
