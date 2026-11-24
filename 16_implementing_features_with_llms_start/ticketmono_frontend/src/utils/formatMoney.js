// The API sends money as a string, e.g. "1250.00" becomes "$1,250.00".
export function formatMoney(amount) {
  return Number(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
