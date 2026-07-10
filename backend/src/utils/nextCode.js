function getNextCode(prefix, existingCodes) {
  const highestNumber = existingCodes.reduce((highest, code) => {
    const parts = code.split("-");
    const number = Number(parts[1]);

    if (Number.isInteger(number) && number > highest) {
      return number;
    }

    return highest;
  }, 0);

  return `${prefix}-${String(highestNumber + 1).padStart(3, "0")}`;
}

function isDuplicateCodeError(error) {
  return Boolean(error) && error.code === "P2002";
}

async function createWithCodeRetry(attemptCreate) {
  try {
    return await attemptCreate();
  } catch (error) {
    if (!isDuplicateCodeError(error)) {
      throw error;
    }

    return attemptCreate();
  }
}

module.exports = {
  getNextCode,
  isDuplicateCodeError,
  createWithCodeRetry
};
