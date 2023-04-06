import classnames from 'classnames/bind';
import { SourceType } from '../../../sources';
import styles from './SourceButton.module.scss';
const cx = classnames.bind(styles);

type Props = {
  source: SourceType;
  isSelected?: boolean;
  onSelect?: (source: SourceType) => void;
};
export function SourceButton({ source, onSelect, isSelected }: Props) {
  return (
    <button
      title={source.slug}
      key={source.slug}
      className={cx('btn', 'source-button', { selected: isSelected })}
      onClick={() => onSelect && onSelect(source)}
    >
      {source.titleIcons?.length && (
        <span className={cx('icons')}>
          {source.titleIcons.map(titleIcon => titleIcon)}
        </span>
      )}
      {source.flag && (
        <span className={cx('icons')}>
          <img
            alt={source.flag}
            src={`https://flagcdn.com/${source.flag}.svg`}
          ></img>
        </span>
      )}
      {source.name ? (
        source.name
      ) : (
        <span
          dangerouslySetInnerHTML={{
            __html: source.titleHtml || ''
          }}
        ></span>
      )}
    </button>
  );
}
