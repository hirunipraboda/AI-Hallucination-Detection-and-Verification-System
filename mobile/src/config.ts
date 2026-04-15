import { Platform } from 'react-native';

// - If running on web, use http://localhost:5001
// - If running Android emulator, use http://10.199.157.139:5001 (or 10.0.2.2)
export const API_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:5001'
    : 'https://crazy-pears-lead.loca.lt';


