import { Share } from 'react-native';
import { Address } from '../types/user';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const base64Encode = (input: string): string => {
  let str = String(input);
  let output = '';
  for (
    let block = 0, charCode: number, idx = 0, map = CHARS;
    str.charAt(idx | 0) || (map = '=', idx % 1);
    output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
  ) {
    charCode = str.charCodeAt((idx += 3 / 4));
    block = (block << 8) | charCode;
  }
  return output;
};

export const base64Decode = (input: string): string => {
  let str = String(input).replace(/[=]+$/, '');
  let output = '';
  for (
    let bc = 0, bs = 0, idx = 0;
    idx < str.length;
  ) {
    const char = str.charAt(idx++);
    const charIndex = CHARS.indexOf(char);
    if (charIndex === -1) continue;
    bs = bc % 4 ? bs * 64 + charIndex : charIndex;
    if (bc++ % 4) {
      output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
    }
  }
  return output;
};

export const encodeAddressToShareCode = (address: Partial<Address>): string => {
  const payload = {
    label: address.label || 'Home',
    recipientName: address.recipientName || 'Friend',
    phone: address.phone || '9876543210',
    houseFlatNumber: address.houseFlatNumber || '',
    streetAddress: address.streetAddress || '',
    landmark: address.landmark || '',
    city: address.city || '',
    pincode: address.pincode || '',
  };
  const jsonStr = JSON.stringify(payload);
  const base64 = base64Encode(encodeURIComponent(jsonStr));
  return `HEALIT-ADDR:${base64}`;
};

export const decodeAddressFromShareCode = (code: string): Partial<Address> | null => {
  try {
    let clean = code.trim();
    if (clean.includes('HEALIT-ADDR:')) {
      clean = clean.split('HEALIT-ADDR:')[1].split(/\s+/)[0];
    } else if (clean.includes('data=')) {
      clean = clean.split('data=')[1].split('&')[0];
    }
    const jsonStr = decodeURIComponent(base64Decode(clean));
    const parsed = JSON.parse(jsonStr);
    if (parsed && (parsed.streetAddress || parsed.houseFlatNumber || parsed.city)) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const shareAddressViaApp = async (address: Address) => {
  const shareCode = encodeAddressToShareCode(address);
  const shareUrl = `https://healit.app/address/import?data=${shareCode}`;

  const message =
    `📍 Shared Address from HEALIT:\n\n` +
    `👤 Recipient: ${address.recipientName}\n` +
    `🏠 ${address.houseFlatNumber}, ${address.streetAddress}` +
    `${address.landmark ? `, Near ${address.landmark}` : ''}, ${address.city} - ${address.pincode}\n\n` +
    `🔗 Tap link to save address in HEALIT:\n${shareUrl}\n\n` +
    `🔑 Or paste code in app: ${shareCode}`;

  try {
    await Share.share({
      title: `HEALIT Address: ${address.label}`,
      message: message,
      url: shareUrl,
    });
  } catch (error) {
    console.error('Error sharing address:', error);
  }
};
