import EcuacionGame from './EcuacionGame'
import { generateLevel4 } from './EcuacionEngine'
import { useLang } from '../../i18n/LanguageContext'

export default function Nivel4() {
  const { t } = useLang()
  return (
    <EcuacionGame
      level={4}
      generator={generateLevel4}
      title={t.ecuaciones.level4.title}
      tutorialSlides={t.ecuaciones.level4.slides}
    />
  )
}
