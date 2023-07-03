# frozen_string_literal: true

class Utils
  PKG = "#{Paths::UTILS}/pkg"
  TARGET = "#{Paths::UTILS}/target"
  NODE_MODULES = "#{Paths::UTILS}/node_modules"
  TEST_OUTPUT = "#{Paths::UTILS}/test_output"
  TARGETS = [PKG, TARGET, NODE_MODULES, TEST_OUTPUT].freeze

  def initialize(reinstall, rebuild)
    @reinstall = reinstall
    @rebuild = rebuild
    @installed = File.exist?(NODE_MODULES)
    @changes_to_files = ChangeChecker.has_changes?(Paths::UTILS, TARGETS)
  end

  attr_reader :changes_to_files

  def self.clean
    TARGETS.each do |path|
      if File.exist?(path)
        Shell.rm_rf(path)
        Reporter.removed(self, "removed: #{path}", '')
      end
    end
  end

  def install
    Shell.rm_rf(NODE_MODULES) if @reinstall
    if !@installed || @reinstall
      Shell.chdir(Paths::UTILS) do
        Reporter.log 'Installing utils libraries'
        Shell.sh 'yarn install'
        Reporter.done(self, 'installing', '')
      end
    else
      Reporter.skipped(self, 'installing', '')
    end
  end

  def build
    if !@changes_to_files && !@rebuild
      Reporter.skipped(self, 'already built', '')
    else
      Environment.check
      [PKG, TARGET].each do |path|
        Shell.rm_rf(path)
        Reporter.removed(self, path, '')
      end
      Shell.chdir(Paths::UTILS) do
        Shell.sh 'wasm-pack build --target bundler'
      end
      Reporter.done(self, "build #{TARGET}", '')
    end
  end
end
