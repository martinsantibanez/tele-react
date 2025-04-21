'use client';
import Link from 'next/link';
import { BsPencilFill, BsXLg } from 'react-icons/bs';
import { useTeleContext } from '../context/TeleContext';

type Props = {};
export function NavBar({}: Props) {
  const { isEditing, toggleEditting } = useTeleContext();

  const handleToggle = () => toggleEditting();

  return (
    <div>
      <div>
        <Link href="/">tele</Link>
        <button
          type="button"
          className="btn btn-default"
          aria-label="Left Align"
          onClick={handleToggle}
        >
          <span
            className="glyphicon glyphicon-align-left"
            aria-hidden="true"
          ></span>
          {isEditing ? <BsXLg color="white" /> : <BsPencilFill color="white" />}
        </button>
      </div>
    </div>
  );
}
