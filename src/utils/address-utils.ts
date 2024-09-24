export function hexStringToBuffer(hexString: string): Buffer {
  // Remove '0x' prefix and convert hex string to buffer
  return Buffer.from(hexString.replace(/^0x/, ''), 'hex');
}

export function bufferToHexString(buffer: Buffer): string {
  // Convert buffer back to hex string, prepend '0x'
  return '0x' + buffer.toString('hex');
}
