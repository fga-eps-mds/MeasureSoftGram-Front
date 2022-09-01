const formatCharacteristicName = (characteristic: string) => characteristic.charAt(0).toUpperCase() + characteristic.slice(1).replaceAll('_', ' ')

export default formatCharacteristicName
