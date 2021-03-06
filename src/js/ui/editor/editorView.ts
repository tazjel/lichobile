import layout from '../layout';
import router from '../../router';
import { header } from '../shared/common';
import Board from '../shared/Board';
import * as helper from '../helper';
import i18n from '../../i18n';
import menu from './menu';
import continuePopup from '../shared/continuePopup';
import pasteFenPopup from './pasteFenPopup'
import settings from '../../settings';
import * as m from 'mithril';
import Editor from './Editor'

export default function view(ctrl: Editor) {
  const color = ctrl.chessground.data.orientation;
  const opposite = color === 'white' ? 'black' : 'white';
  const isPortrait = helper.isPortrait();
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'editor');

  const board = m(Board, {
    variant: ctrl.data.game.variant.key,
    chessgroundCtrl: ctrl.chessground,
    bounds,
    isPortrait: helper.isPortrait()
  });

  function content() {
    return m.fragment({ key: isPortrait ? 'portrait' : 'landscape' }, [
      board,
      m('div.editor-wrapper', [
        m('div#boardEditor.editor-table', {
          className: settings.general.theme.piece(),
          oncreate: ctrl.editorOnCreate,
          onremove: ctrl.editorOnRemove
        }, [
          m('div.editor-piecesDrawer', [
            sparePieces(ctrl, opposite, color, 'top'),
            sparePieces(ctrl, color, color, 'bottom')
          ]),
        ]),
        renderActionsBar(ctrl)
      ])
    ]);
  }

  function overlay() {
    return [
      menu.view(ctrl.menu),
      continuePopup.view(ctrl.continuePopup),
      pasteFenPopup.view(ctrl.pasteFenPopup)
    ]
  }

  return layout.board(
    () => header(i18n('boardEditor')),
    content,
    overlay
  );
}

function sparePieces(ctrl: Editor, color: Color, orientation: Color, position: 'top' | 'bottom') {
  return m('div', {
    className: ['sparePieces', position, 'orientation-' + orientation, color].join(' ')
  }, m('div.sparePiecesInner', ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map((role) => {
    return m('div.sparePiece', m('piece', {
      className: color + ' ' + role,
      'data-color': color,
      'data-role': role
    }));
  })));
}

function renderActionsBar(ctrl: Editor) {
  return m('section.actions_bar', [
    m('button.action_bar_button.fa.fa-ellipsis-h', {
      key: 'editorMenu',
      oncreate: helper.ontap(ctrl.menu.open)
    }),
    m('button.action_bar_button[data-icon=B]', {
      key: 'toggleOrientation',
      oncreate: helper.ontap(ctrl.chessground.toggleOrientation)
    }),
    m('button.action_bar_button[data-icon=U]', {
      key: 'continueFromHere',
      oncreate: helper.ontap(() => {
        ctrl.continuePopup.open(ctrl.computeFen());
      }, () => window.plugins.toast.show(i18n('continueFromHere'), 'short', 'center'))
    }),
    m('button.action_bar_button[data-icon=A]', {
      key: 'analyse',
      oncreate: helper.ontap(() => {
        const fen = encodeURIComponent(ctrl.computeFen());
        router.set(`/analyse/fen/${fen}`);
      }, () => window.plugins.toast.show(i18n('analysis'), 'short', 'center'))
    }),
    m('button.action_bar_button.fa.fa-upload', {
      key: 'pastePosition',
      oncreate: helper.ontap(ctrl.pasteFenPopup.open,
        () => window.plugins.toast.show(i18n('Load position from FEN'), 'short', 'center'))
    }),
    m('button.action_bar_button.fa.fa-share-alt', {
      key: 'sharePosition',
      oncreate: helper.ontap(
        () => window.plugins.socialsharing.share(ctrl.computeFen()),
        () => window.plugins.toast.show('Share FEN', 'short', 'bottom')
      )
    })
  ])
}
