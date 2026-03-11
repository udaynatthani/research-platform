const linkRepository = require("../repositories/linkRepository");

const createLink = async (data) => {
  const { source_type, source_id, target_type, target_id } = data;

  if (!source_type || !source_id || !target_type || !target_id) {
    throw new Error("All link fields are required");
  }

  return await linkRepository.createLink(
    source_type,
    source_id,
    target_type,
    target_id
  );
};

const getLinks = async () => {
  return await linkRepository.getLinks();
};

module.exports = {
  createLink,
  getLinks
};