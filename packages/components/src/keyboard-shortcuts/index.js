/**
 * External dependencies
 */
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import { forEach } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Children } from '@wordpress/element';

class KeyboardShortcuts extends Component {
	constructor() {
		super( ...arguments );

		this.bindKeyTarget = this.bindKeyTarget.bind( this );
	}

	componentDidMount() {
		const { keyTarget = document } = this;

		this.mousetrap = new Mousetrap( keyTarget );
		forEach( this.props.shortcuts, ( callback, key ) => {
			const { bindGlobal, eventName, ignoreChildHandled } = this.props;
			const bindFn = bindGlobal ? 'bindGlobal' : 'bind';

			if ( ignoreChildHandled ) {
				// Override callback to consider whether event has already been
				// handled in a descendent KeyboardShortcuts in considering to
				// call the original handler, stored by reference via closure.
				callback = ( ( originalCallback ) => function( event ) {
					if ( ! event._keyboardShortcutsHandled ) {
						return originalCallback.apply( this, arguments );
					}
				} )( callback );
			}

			// Assign handled flag for consideration of ancestor; importantly
			// only after considering flag presence to stop execution.
			callback = ( ( originalCallback ) => function( event ) {
				const returnValue = originalCallback.apply( this, arguments );
				event._keyboardShortcutsHandled = true;
				return returnValue;
			} )( callback );

			this.mousetrap[ bindFn ]( key, callback, eventName );
		} );
	}

	componentWillUnmount() {
		this.mousetrap.reset();
	}

	/**
	 * When rendering with children, binds the wrapper node on which events
	 * will be bound.
	 *
	 * @param {Element} node Key event target.
	 */
	bindKeyTarget( node ) {
		this.keyTarget = node;
	}

	render() {
		// Render as non-visual if there are no children pressed. Keyboard
		// events will be bound to the document instead.
		const { children } = this.props;
		if ( ! Children.count( children ) ) {
			return null;
		}

		return <div ref={ this.bindKeyTarget }>{ children }</div>;
	}
}

export default KeyboardShortcuts;
