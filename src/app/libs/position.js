/*
 * those values MUST stay in sync with the ones in bundle.styl
 * they're used by trigo to place users on the circle without causing overflow.
 * it's a chicken and egg problem, React can't know an element dimensions before
 * rendering it, and when it does it's too late.
 */
const USER_WIDTH = 130;
const USER_HEIGHT = 207;

// CSS origin (0,0) is top-left corner, center of circle is in bottom-middle
const getCircleCenterCoords = boxDimensions => {
  return {
    x: Math.round(boxDimensions.width / 2),
    y: Math.round(boxDimensions.height /* * (3 / 4)*/)
  };
};

// smallest dimension of parent container
// also need to deal with user badges which are centered
const getCircleRadius = boxDimensions => {
  return Math.round(boxDimensions.width / 1.5);
};

const bound = (min, value, max) => {
  return Math.max(min, Math.min(value, max));
};

// x = [-1, 1], y = [0, -1]
export const getRelativePosition = (width, height, posX, posY) => {
  const maxWidth = width - USER_WIDTH;
  const halfMaxWidth = maxWidth / 2;
  const maxHeight = height - USER_HEIGHT;

  return {
    x: bound(-1, (posX - halfMaxWidth) / (halfMaxWidth * 2), 1),
    y: bound(-1, (posY - maxHeight) / maxHeight, 0)
  };
};

export const getBoundedPosition = ({
  width,
  height,
  posX,
  posY,
  ...params
}) => {
  const maxWidth = width - USER_WIDTH;
  const maxHeight = height - USER_HEIGHT;

  return {
    width: width,
    height: height,
    posX: bound(0, posX, maxWidth),
    posY: bound(0, posY, maxHeight),
    ...params
  };
};

export const getAbsolutePosition = ({ width, height, x, y, ...params }) => {
  const maxWidth = width - USER_WIDTH;
  const halfMaxWidth = maxWidth / 2;
  const maxHeight = height - USER_HEIGHT;

  return {
    width: width,
    height: height,
    posX: bound(0, halfMaxWidth * (x + 1), maxWidth),
    posY: bound(0, maxHeight * (y + 1), maxHeight),
    ...params
  };
};

export const getOrganizedPosition = ({
  width,
  height,
  size,
  index,
  ...params
}) => {
  const maxWidth = width - USER_WIDTH;
  const maxHeight = height - USER_HEIGHT;
  const slots = 8;
  const centerCoords = getCircleCenterCoords({
    width: maxWidth,
    height: maxHeight
  });
  let radius = getCircleRadius({
    width: maxWidth,
    height: maxHeight
  });
  let size_t = 0;

  if (size >= slots) {
    size_t = slots;
  } else {
    size_t = size % slots;
  }

  const step = Math.PI / size_t;
  let index_t = 0;

  if (index >= slots) {
    radius = radius * 1.4;
    index_t = index % slots;
  } else {
    index_t = index;
  }

  const index_t2 =
    Math.floor(size_t / 2) -
    ((size_t - 1) % 2) +
    ((index_t % 2) * 2 - 1) * Math.ceil(index_t / 2);
  const angle = Math.PI - index_t2 * step - step / 2;

  return getBoundedPosition({
    width: width,
    height: height,
    posX: Math.round(centerCoords.x + (radius * Math.cos(angle)) / 2),
    posY: Math.round(
      centerCoords.y - (radius * Math.sin(angle)) / 2 + USER_HEIGHT
    ),
    ...params
  });
};

const getPosY = participant => {
  const posY = participant && participant.posY ? participant.posY : 0;
  return Math.round(parseInt(posY, 10) / 10);
};

const getPosYmedian = ({ positions, participants }) => {
  const posYsum = participants.reduce(
    (sum, p) => sum + getPosY(positions[p.id]),
    0
  );
  return posYsum / participants.length;
};

const getSameLineParticipants = ({
  positions,
  participants,
  posYmedian,
  participantId
}) => {
  if (participants.length === 2 && Object.keys(positions).length === 2) {
    const p1 = positions[participantId];
    const p2 = positions[participants.find(p => p.id !== participantId).id];
    const xDist = Math.round(Math.abs(p1.posX - p2.posX));
    return xDist < 160 ? [{ id: participantId }] : participants;
  }
  return getPosY(positions[participantId]) <= posYmedian
    ? participants.filter(p => getPosY(positions[p.id]) <= posYmedian)
    : participants.filter(p => getPosY(positions[p.id]) > posYmedian);
};

const getTileWidth = ({ sameLineParticipants, dimensions }) => {
  return dimensions.width / sameLineParticipants.length;
};

const getTileHeight = ({ sameLineParticipants, dimensions, participants }) => {
  const { height } = dimensions;
  const otherLineParticipantsLength =
    participants.length - sameLineParticipants.length;
  return otherLineParticipantsLength > 0 ? height / 2 : height;
};

const getXOrder = ({ sameLineParticipants, positions, participantId }) => {
  const oderedSameLineParticipants = sameLineParticipants.sort((p1, p2) =>
    positions[p1.id] && positions[p2.id]
      ? positions[p1.id].posX - positions[p2.id].posX
      : 0
  );
  return oderedSameLineParticipants.findIndex(p => p.id === participantId);
};

const getTilePosY = ({
  sameLineParticipants,
  participants,
  positions,
  participantId,
  posYmedian,
  tH
}) => {
  if (participants.length === 2 && sameLineParticipants.length === 2) {
    return 0;
  }
  return getPosY(positions[participantId]) <= posYmedian ? 0 : tH;
};

const getTilePosition = ({
  positions,
  participants,
  participant,
  dimensions
}) => {
  const participantId = participant.userId;
  const posYmedian = getPosYmedian({ positions, participants });
  const sameLineParticipants = getSameLineParticipants({
    positions,
    participants,
    posYmedian,
    participantId
  });
  const tW = getTileWidth({ sameLineParticipants, dimensions });
  const tH = getTileHeight({ sameLineParticipants, dimensions, participants });
  const xOrder = getXOrder({ sameLineParticipants, positions, participantId });
  const tY = getTilePosY({
    sameLineParticipants,
    participants,
    positions,
    participantId,
    posYmedian,
    tH
  });
  return { tX: xOrder * tW, tY, tW, tH };
};

const getSpeakerModePosition = ({
  positions,
  participants,
  participant,
  dimensions
}) => {
  const participantId = participant.userId;
  const sameLineParticipants = participants;
  const tW = getTileWidth({ sameLineParticipants, dimensions });
  const tH = dimensions.height / 4;
  const xOrder = getXOrder({ sameLineParticipants, positions, participantId });
  return { tX: xOrder * tW, tY: 0, tW, tH };
};

export const getPosition = ({
  mode,
  positions,
  participants,
  participant,
  dimensions
}) => {
  switch (mode) {
    case "gallery":
      return getTilePosition({
        positions,
        participants,
        participant,
        dimensions
      });
    case "speaker":
      return getSpeakerModePosition({
        positions,
        participants,
        participant,
        dimensions
      });
    case "room":
    default:
      const { posX, posY } = positions[participant.userId] || {
        posX: 0,
        posY: 0
      };
      return { tX: posX, tY: posY, tW: 100, tH: 100 };
  }
};
