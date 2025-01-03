const { randomBytes } = await import("node:crypto");

export function generateCrypto() {
  return randomBytes(256, (err, buf) => {
    if (err) throw err;
    return `${buf.toString("hex")}`;
  });
}
