import axios from 'axios';
import { ScreenType } from '../../types/Monitor';

/**
 * Things that can be done with a whole screen, kept out of the monitor because
 * nothing calls them right now: the Destacar and Compartir buttons were taken
 * out of the control bar while the pages behind them sit parked under
 * `src/_pages`, so neither has anywhere to land yet.
 *
 * Promoting a screen never needed a helper — it is the setter from
 * `useFeaturedScreen`, whose stored value the parked `/promoted` page reads.
 */

/**
 * Publishes the screen and returns a link to it, good for 24 hours. The
 * endpoint is parked with the rest, so this will 404 until it moves into the
 * app router.
 */
export async function shareScreen(screen: ScreenType): Promise<string> {
  const response = await axios.post('/api/share', screen);
  return `${window.location.origin}/shared/${response.data.uuid}`;
}
