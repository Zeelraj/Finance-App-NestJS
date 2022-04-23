export const generateAccountNo = (no = '1234567890') => {
  const random_no = Math.floor(1000 + Math.random() * 9000);

  const account_no = 'FA' + random_no + 'OLB' + no.slice(no.length - 4);

  return account_no;
};
