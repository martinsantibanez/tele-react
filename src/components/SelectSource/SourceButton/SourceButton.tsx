import classnames from 'classnames/bind';
import { SourceType } from '../../../sources';
import styles from './SourceButton.module.scss';
import { Button } from '../../../../components/ui/button';
const cx = classnames.bind(styles);

type Props = {
  source: SourceType;
  isSelected?: boolean;
  onSelect?: (source: SourceType) => void;
};
export function SourceButton({ source, onSelect, isSelected }: Props) {
  return (
    <Button
      variant="outline"
      onClick={() => onSelect && onSelect(source)}
      className={
        cx('btn', 'source-button', { selected: isSelected }) + ' mb-2 ms-1'
      }
    >
      <div>
        {source.titleIcons?.length && (
          <span className={cx('icons')}>
            {source.titleIcons.map(titleIcon => titleIcon)}
          </span>
        )}
      </div>
      {source.flag && (
        <span className={cx('icons')}>
          <img
            className="img-fluid"
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
    </Button>
  );
}
