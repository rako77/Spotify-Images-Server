import { LitElement, html, customElement, property, TemplateResult, PropertyValues } from 'lit-element';
import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';

@customElement('spotify-metafy-frontend')
export class BoilerplateCard extends LitElement {
  public static getStubConfig(): object {
    return {};
  }

  @property() public hass?: HomeAssistant;
  @property() private _helpers?: any;
  @property() private _config?: any;
  @property() private _cardConfig?: any;
  @property() private _card?: LovelaceCard;
  @property() private _entities?: any;

  public async setConfig(config): Promise<void> {
    if (
      !config ||
      ((!config.entitys || !Array.isArray(config.entitys)) && (!config.entities || !Array.isArray(config.entities)))
    ) {
      throw new Error('Card config incorrect');
    }

    this._entities = config.entities || config.entitys;

    if (!this._helpers) {
      await this.loadCardHelpers();
    }

    let cardsConfigs: any[] = [];
    for (let entity of this._entities) {
      let picHref = this.hass?.states[entity].attributes.entity_picture;
      let cardConfig = {
        double_tap_action: {
          action: 'more-info',
        },
        image: picHref,
        tap_action: {
          action: 'call-service',
          service: 'media_player.media_play',
          service_data: {
            entity_id: entity,
          },
        },
        type: 'picture-entity',
        entity: entity,
        show_state: false,
        show_name: false,
        aspect_ratio: '100%',
        state_filter: {
          playing: 'opacity(100%)',
          paused: 'opacity(80%)',
          idle: 'opacity(80%)',
          unavailable: 'opacity(40%) grayscale(100%)',
        },
      };
      cardsConfigs.push(cardConfig);
    }
    let card = {
      cards: cardsConfigs,
      type: 'horizontal-stack',
    };

    this._cardConfig = card;
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    super.updated(changedProps);
    if (changedProps.has('_config')) {
      return true;
    }

    if (this._config) {
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

      if (oldHass) {
        let changed = false;
        this._entities.forEach(entity => {
          changed = changed || Boolean(this.hass && oldHass.states[entity] !== this.hass.states[entity]);
        });

        return changed;
      }
    }
    return true;
  }

  protected render(): TemplateResult | void {
    if (!this._cardConfig || !this.hass) {
      return html``;
    }

    this._card = this._helpers.createCardElement(this._cardConfig) as LovelaceCard;
    this._card.hass = this.hass;

    return html`
      ${this._card}
    `;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }
}
