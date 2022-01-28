const getMatchedUserInfo = (users, userLoggenIn) => {
  const newUsers = { ...users };
  delete newUsers[userLoggenIn]; //remove the userloggen in object

  const [id, user] = Object.entries(newUsers).flat();

  return { id, ...user };
};

export default getMatchedUserInfo;
