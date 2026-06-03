export const formatTypos = ({path, typo, corrections}) => {
    return `${path}: ${typo} -> ${corrections.join(', ')}`;
};
