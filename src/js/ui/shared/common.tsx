import * as menu from '../menu';
import getVariant from '../../lichess/variant';
import router from '../../router';
import * as utils from '../../utils';
import { emptyFen } from '../../utils/fen';
import { hasOfflineGames } from '../../utils/offlineGames';
import settings from '../../settings';
import layout from '../layout';
import * as helper from '../helper';
import gamesMenu from '../gamesMenu';
import newGameForm from '../newGameForm';
import session from '../../session';
import * as gameApi from '../../lichess/game';
import challengesApi from '../../lichess/challenges';
import friendsApi from '../../lichess/friends';
import i18n from '../../i18n';
import popupWidget from './popup';
import { getLanguageNativeName } from '../../utils/langs';
import friendsPopup from '../friendsPopup';
import * as m from 'mithril';
import spinner from '../../spinner';
import countries from '../../utils/countries';
import ViewOnlyBoard from './ViewOnlyBoard';

export const LoadingBoard = {
  view() {
    return layout.board(
      connectingHeader,
      () => viewOnlyBoardContent(emptyFen)
    );
  }
};

export function menuButton() {
  return (
    <button key="main-menu" className="fa fa-navicon main_header_button menu_button" oncreate={helper.ontap(menu.toggle)}>
    </button>
  );
}

export function backButton(title?: string | Mithril.Children) {
  return (
    <button key="default-history-backbutton" className="back_button main_header_button" oncreate={helper.ontap(router.backHistory)}>
      <span className="fa fa-arrow-left"/>
      {title ? <div className="title">{title}</div> : null }
    </button>
  );
}

export function friendsButton() {
  const nbFriends = friendsApi.count();
  const longAction = () => window.plugins.toast.show(i18n('onlineFriends'), 'short', 'top');

  return (
    <button className="main_header_button friends_button" key="friends" data-icon="f"
      oncreate={helper.ontap(friendsPopup.open, longAction)}
    >
    {nbFriends > 0 ?
      <span className="chip nb_friends">{nbFriends}</span> : null
    }
    </button>
  );
}

let boardTheme: string;
export function onBoardThemeChange(theme: string) {
  boardTheme = theme;
}
function gamesButton() {
  let key: string, action: () => void;
  const nbChallenges = challengesApi.all().length;
  const nbIncomingChallenges = challengesApi.incoming().length;
  const withOfflineGames = !utils.hasNetwork() && hasOfflineGames();
  boardTheme = boardTheme || settings.general.theme.board();
  if (session.nowPlaying().length || nbChallenges || withOfflineGames) {
    key = 'games-menu';
    action = gamesMenu.open;
  } else {
    key = 'new-game-form';
    action = newGameForm.open;
  }
  const myTurns = session.myTurnGames().length;
  const className = [
    'main_header_button',
    'game_menu_button',
    boardTheme,
    nbIncomingChallenges ? 'new_challenge' : '',
    !utils.hasNetwork() && !hasOfflineGames() ? 'invisible' : ''
  ].join(' ');
  const longAction = () => window.plugins.toast.show(i18n('nbGamesInPlay', session.nowPlaying().length), 'short', 'top');

  return (
    <button key={key} className={className} oncreate={helper.ontap(action, longAction)}>
      {!nbIncomingChallenges && myTurns ?
        <span className="chip nb_playing">{myTurns}</span> : null
      }
      {nbIncomingChallenges ?
        <span className="chip nb_challenges">{nbChallenges}</span> : null
      }
    </button>
  );
}

export function headerBtns() {
  if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
    return (
      <div key="buttons" className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    );
  } else if (utils.hasNetwork() && session.isConnected()) {
    return (
      <div key="buttons" className="buttons">
        {gamesButton()}
      </div>
    );
  } else if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
    return (
      <div key="buttons" className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    );
  }
  else {
    return (
      <div key="buttons" className="buttons">
        {gamesButton()}
      </div>
    );
  }
}

export function header(title: Mithril.Children, leftButton?: () => Mithril.Children) {
  return (
    <nav>
      {leftButton ? leftButton : menuButton()}
      {title ? <h1 key="title">{title}</h1> : null}
      {headerBtns()}
    </nav>
  );
}

export const loader = (
  <div className="loader_circles">
    {[1, 2, 3].map(i => <div className={'circle_' + i} />)}
  </div>
);

export function connectingHeader(title?: string) {
  return (
    <nav>
      {menuButton()}
      <h1 key="connecting-title" className={'reconnecting' + (title ? 'withTitle' : '')}>
        {title ? <span>{title}</span> : null}
        {loader}
      </h1>
      {headerBtns()}
    </nav>
  );
}

export function loadingBackbutton(title?: string) {
  return (
    <nav>
      {backButton()}
      <h1 key="connecting-backbutton" className={'reconnecting' + (title ? 'withTitle' : '')}>
        {title ? <span>{title}</span> : null}
        {loader}
      </h1>
      {headerBtns()}
    </nav>
  );
}

export function viewOnlyBoardContent(fen?: string, lastMove?: string, orientation?: Color, variant?: VariantKey, wrapperClass?: string, customPieceTheme?: string) {
  const isPortrait = helper.isPortrait();
  const { vw, vh } = helper.viewportDim();
  const orientKey = 'viewonlyboard' + (isPortrait ? 'portrait' : 'landscape');
  const bounds = isPortrait ? { width: vw, height: vw } : { width: vh - 50, height: vh - 50 };
  const className = 'board_wrapper' + (wrapperClass ? ' ' + wrapperClass : '');
  const board = (
    <section className={className}>
      {m(ViewOnlyBoard, {bounds, fen, lastMove, orientation, variant, customPieceTheme})}
    </section>
  );
  if (isPortrait) {
    return m.fragment({ key: orientKey }, [
      <section className="playTable">&nbsp;</section>,
      board,
      <section className="playTable">&nbsp;</section>,
      <section className="actions_bar">&nbsp;</section>
    ]);
  } else {
    return m.fragment({ key: orientKey}, [
      board,
      <section className="table" />
    ]);
  }
}

export function empty(): Mithril.Children {
  return [];
}

export function userStatus(user: User) {
  const status = user.online ? 'online' : 'offline';
  return (
    <div className="user">
      {user.patron ?
        <span className={'patron userStatus ' + status} data-icon="" /> :
        <span className={'fa fa-circle userStatus ' + status} />
      }
      {user.title ? <span className="userTitle">{user.title}&nbsp;</span> : null}
      {user.username}
    </div>
  );
}

export function gameTitle(data: GameData): Mithril.Children {
  const mode = data.game.offline ? i18n('offline') :
    data.game.rated ? i18n('rated') : i18n('casual');
  const variant = getVariant(data.game.variant.key);
  const name = variant ? (variant.tinyName || variant.shortName || variant.name) : '?';
  const icon = data.game.source === 'import' ? '/' :
    utils.gameIcon(data.game.perf || data.game.variant.key);
  const time = gameApi.time(data);
  const text = data.game.source === 'import' ?
    `Import • ${name}` :
    `${time} • ${name} • ${mode}`;
  return [
    <span className="withIcon" data-icon={icon} />,
    <span>{text}</span>
  ];
}


export function miniUser(user: User, mini: any, isOpen: boolean, close: () => void) {
  if (!user) return null;

  const status = userStatus(user);

  function content() {
    if (!mini) {
      return (
        <div key="loading" className="miniUser">
          {spinner.getVdom()}
        </div>
      );
    }
    const sessionUserId = session.get() && session.get().id;
    return (
      <div key="loaded" className="miniUser">
        <div className="title">
          <div className="username" oncreate={helper.ontap(() => router.set(`/@/${user.username}`))}>
            {status}
          </div>
          { user.profile && user.profile.country ?
            <p className="country">
              <img className="flag" src={'images/flags/' + user.profile.country + '.png'} />
              {countries[user.profile.country]}
            </p> : user.language ?
              <p className="language">
                <span className="fa fa-comment-o" />
                {getLanguageNativeName(user.language)}
              </p> : null
          }
        </div>
        { mini.perfs ?
          <div className="mini_perfs">
            {Object.keys(mini.perfs).map(p => {
              const perf = mini.perfs[p];
              return (
                <div className="perf">
                  <span data-icon={utils.gameIcon(p)} />
                  {perf.games > 0 ? perf.rating + (perf.prov ? '?' : '') : '-'}
                </div>
              );
            })}
          </div> : null
        }
        { mini.crosstable && mini.crosstable.nbGames > 0 ?
          <div className="yourScore">
            Your score: <span className="score">{`${mini.crosstable.users[sessionUserId]} - ${mini.crosstable.users[user.id]}`}</span>
          </div> : null
        }
      </div>
    );
  }

  return popupWidget(
    'miniUserInfos',
    null,
    content,
    isOpen,
    close
  );
}
